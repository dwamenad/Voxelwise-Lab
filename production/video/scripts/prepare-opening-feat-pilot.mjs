import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  encodeNarrationClip,
  loadVoiceRegistry,
  prepareNarrationClip,
  removePreparedClip,
  verifyInstalledVoices,
} from "./audio-pipeline.mjs";
import { formatTimestamp, splitCaptionCues, wordCount } from "./narration-utils.mjs";

const projectRoot = process.cwd();
const slug = "opening-feat";
const fps = 30;
const captureFps = 5;
const defaultCaptureRoot = path.resolve(projectRoot, "..", "pilot-raw", slug);
const captureRoot = path.resolve(process.argv[2] ?? process.env.LIVE_CAPTURE_ROOT ?? defaultCaptureRoot);
const narrationPath = path.join(projectRoot, "production", "narration", `${slug}.md`);
const publicRoot = path.join(projectRoot, "public", "video-production", "walkthroughs", slug);
const audioRoot = path.join(publicRoot, "audio-v3");
const frameRoot = path.join(publicRoot, "frames");
const outputRoot = path.join(projectRoot, "production", "video", "output", "walkthroughs", slug, "v3");
const generatedPath = path.join(projectRoot, "production", "video", "generated", "walkthroughs", `${slug}.json`);
const registry = await loadVoiceRegistry();

const visualGroups = [
  ["01-environment", "02-menu-neurodesk", "03-menu-functional", "04-menu-fsl", "06-load-fsl-60722"],
  ["08-launch-feat-gui", "09-feat-overview"],
  ["10-first-level-scope", "11-full-analysis-scope"],
  ["12-data-tab", "13-prestats-tab", "14-registration-tab", "15-stats-tab", "16-poststats-tab", "17-misc-tab"],
  ["18-closing-overview"],
];

const markdown = await readFile(narrationPath, "utf8");
const narrationScenes = markdown
  .split(/^## /m)
  .slice(1)
  .map((block, index) => {
    const [titleLine, ...bodyLines] = block.trim().split("\n");
    return {
      id: `section-${index + 1}`,
      title: titleLine.replace(/^\d+\.\s*/, "").trim(),
      narrationText: bodyLines.join("\n").replace(/\n{2,}/g, "\n\n").trim(),
    };
  });

if (narrationScenes.length !== visualGroups.length) {
  throw new Error(`Expected ${visualGroups.length} narration sections, found ${narrationScenes.length}.`);
}

await verifyInstalledVoices(registry);
await Promise.all([
  mkdir(audioRoot, { recursive: true }),
  mkdir(outputRoot, { recursive: true }),
  mkdir(path.dirname(generatedPath), { recursive: true }),
]);
await rm(frameRoot, { recursive: true, force: true });
await mkdir(frameRoot, { recursive: true });

const visualSceneMetadata = new Map();
for (const sceneName of visualGroups.flat()) {
  const sourceDirectory = path.join(captureRoot, sceneName);
  const frameFiles = (await readdir(sourceDirectory)).filter((file) => file.endsWith(".png")).sort();
  if (!frameFiles.length) throw new Error(`No PNG frames found in ${sourceDirectory}`);
  const targetDirectory = path.join(frameRoot, sceneName);
  await mkdir(targetDirectory, { recursive: true });
  await Promise.all(frameFiles.map((file) => copyFile(path.join(sourceDirectory, file), path.join(targetDirectory, file))));
  visualSceneMetadata.set(sceneName, {
    id: sceneName,
    assetRoot: `video-production/walkthroughs/${slug}/frames/${sceneName}`,
    frameCount: frameFiles.length,
  });
}

const tracks = new Map(
  registry.voices.map((voice) => [voice.id, { voiceId: voice.id, displayName: voice.displayName, accent: voice.accent, locale: voice.locale, speechRate: voice.speechRate, scenes: [], cues: [], qc: [] }]),
);
const sceneTiming = [];
let timelineSeconds = 0;
let timelineFrames = 0;

for (const [sceneIndex, scene] of narrationScenes.entries()) {
  const preparedByVoice = new Map(
    await Promise.all(
      registry.voices.map(async (voice) => {
        const voiceDirectory = path.join(audioRoot, voice.id);
        const prepared = await prepareNarrationClip({
          text: scene.narrationText,
          voice,
          basename: scene.id,
          workingDirectory: voiceDirectory,
          targets: registry.audioTargets,
        });
        return [voice.id, prepared];
      }),
    ),
  );

  const speechSeconds = Math.max(...[...preparedByVoice.values()].map((prepared) => prepared.cleanedDurationSeconds));
  const durationInFrames = Math.ceil((speechSeconds + registry.audioTargets.sceneTailSeconds) * fps);
  const durationSeconds = durationInFrames / fps;

  await Promise.all(registry.voices.map(async (voice) => {
    const prepared = preparedByVoice.get(voice.id);
    const outputPath = path.join(audioRoot, voice.id, `${scene.id}.m4a`);
    const encoded = await encodeNarrationClip({
      cleanWavPath: prepared.cleanWavPath,
      outputPath,
      durationSeconds,
      targets: registry.audioTargets,
    });
    await removePreparedClip(prepared);
    const track = tracks.get(voice.id);
    const captionTexts = splitCaptionCues(scene.narrationText);
    const totalWords = captionTexts.reduce((sum, cue) => sum + wordCount(cue), 0);
    let cueOffset = 0;
    for (const captionText of captionTexts) {
      const cueDuration = prepared.cleanedDurationSeconds * (wordCount(captionText) / Math.max(1, totalWords));
      const startSeconds = timelineSeconds + cueOffset;
      const endSeconds = startSeconds + cueDuration;
      track.cues.push({
        index: track.cues.length + 1,
        text: captionText,
        startSeconds,
        endSeconds,
        startFrame: Math.floor(startSeconds * fps),
        endFrame: Math.ceil(endSeconds * fps),
      });
      cueOffset += cueDuration;
    }
    track.scenes.push({
      id: scene.id,
      audioPath: `video-production/walkthroughs/${slug}/audio-v3/${voice.id}/${scene.id}.m4a`,
      audioSeconds: prepared.cleanedDurationSeconds,
    });
    track.qc.push({
      sceneId: scene.id,
      sourcePeakDbfs: prepared.sourcePeakDbfs,
      sourceNoiseFloorDbfs: prepared.sourceNoiseFloorDbfs,
      clippedSamples: prepared.clippedSamples,
      integratedLufs: encoded.integratedLufs,
      truePeakDb: encoded.truePeakDb,
      loudnessRange: encoded.loudnessRange,
      clippingPassed: encoded.clippingPassed,
      loudnessPassed: encoded.loudnessPassed,
    });
  }));

  sceneTiming.push({
    id: scene.id,
    title: scene.title,
    durationSeconds,
    durationInFrames,
    startSeconds: timelineSeconds,
    startFrame: timelineFrames,
    visualScenes: visualGroups[sceneIndex].map((sceneName) => visualSceneMetadata.get(sceneName)),
  });
  timelineSeconds += durationSeconds;
  timelineFrames += durationInFrames;
}

const voiceTracks = registry.voices.map((voice) => tracks.get(voice.id));
const failedQc = voiceTracks.flatMap((track) =>
  track.qc
    .filter((item) => !item.loudnessPassed || !item.clippingPassed || item.clippedSamples > 0)
    .map((item) => `${track.voiceId}/${item.sceneId}`),
);
if (failedQc.length) throw new Error(`Opening FEAT audio QC failed: ${failedQc.join(", ")}`);
await Promise.all(
  voiceTracks.map((track) =>
    writeFile(
      path.join(outputRoot, `${slug}-${track.voiceId}.srt`),
      `${track.cues.map((cue) => `${cue.index}\n${formatTimestamp(cue.startSeconds)} --> ${formatTimestamp(cue.endSeconds)}\n${cue.text}`).join("\n\n")}\n`,
    ),
  ),
);

const manifest = {
  version: 3,
  slug,
  compositionId: "OpeningFeatWalkthrough",
  fps,
  captureFps,
  width: 1920,
  height: 1080,
  totalFrames: timelineFrames,
  totalSeconds: timelineSeconds,
  defaultVoiceId: registry.defaultVoiceId,
  audioTargets: registry.audioTargets,
  scenes: sceneTiming,
  voiceTracks,
};

await Promise.all([
  writeFile(generatedPath, `${JSON.stringify(manifest, null, 2)}\n`),
  writeFile(path.join(outputRoot, `${slug}-transcript.md`), `${markdown.trim()}\n`),
]);

console.log(`Prepared ${slug}: ${timelineSeconds.toFixed(1)} seconds × ${voiceTracks.length} voices, ${visualSceneMetadata.size} authentic capture scenes.`);
