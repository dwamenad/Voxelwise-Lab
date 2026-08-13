import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  encodeNarrationClip,
  loadVoiceRegistry,
  prepareNarrationClip,
  removePreparedClip,
  verifyInstalledVoices,
} from "./audio-pipeline.mjs";
import { formatTimestamp, splitCaptionCues, wordCount } from "./narration-utils.mjs";

const cueTiming = ({ text, audioSeconds, sceneStartSeconds, fps, firstIndex }) => {
  const captionTexts = splitCaptionCues(text);
  const totalWords = captionTexts.reduce((sum, cue) => sum + wordCount(cue), 0);
  let cueOffset = 0;
  return captionTexts.map((captionText, offset) => {
    const cueDuration = audioSeconds * (wordCount(captionText) / Math.max(1, totalWords));
    const startSeconds = sceneStartSeconds + cueOffset;
    const endSeconds = startSeconds + cueDuration;
    cueOffset += cueDuration;
    return {
      index: firstIndex + offset,
      text: captionText,
      startSeconds,
      endSeconds,
      startFrame: Math.floor(startSeconds * fps),
      endFrame: Math.ceil(endSeconds * fps),
    };
  });
};

const srt = (cues) =>
  `${cues
    .map(
      (cue) =>
        `${cue.index}\n${formatTimestamp(cue.startSeconds)} --> ${formatTimestamp(cue.endSeconds)}\n${cue.text}`,
    )
    .join("\n\n")}\n`;

export const buildMultivoiceNarration = async ({
  video,
  publicAudioRoot,
  publicAudioBase,
  outputDirectory,
}) => {
  const registry = await loadVoiceRegistry();
  await verifyInstalledVoices(registry);
  await Promise.all([
    mkdir(publicAudioRoot, { recursive: true }),
    mkdir(outputDirectory, { recursive: true }),
  ]);

  const tracks = new Map(
    registry.voices.map((voice) => [
      voice.id,
      {
        voiceId: voice.id,
        engineVoice: voice.engineVoice,
        displayName: voice.displayName,
        accent: voice.accent,
        locale: voice.locale,
        speechRate: voice.speechRate,
        scenes: [],
        cues: [],
        qc: [],
      },
    ]),
  );
  const canonicalScenes = [];
  let timelineSeconds = 0;
  let timelineFrames = 0;

  for (const scene of video.scenes) {
    if (!scene.narrationText) throw new Error(`Missing narrationText: ${video.slug}/${scene.id}`);
    const preparedByVoice = new Map(
      await Promise.all(
        registry.voices.map(async (voice) => {
          const voiceDirectory = path.join(publicAudioRoot, voice.id);
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

    const speechSeconds = Math.max(
      ...[...preparedByVoice.values()].map((prepared) => prepared.cleanedDurationSeconds),
    );
    const durationSeconds = speechSeconds + registry.audioTargets.sceneTailSeconds;
    const durationInFrames = Math.ceil(durationSeconds * video.fps);
    const canonicalDurationSeconds = durationInFrames / video.fps;

    await Promise.all(registry.voices.map(async (voice) => {
      const prepared = preparedByVoice.get(voice.id);
      const outputPath = path.join(publicAudioRoot, voice.id, `${scene.id}.m4a`);
      const encoded = await encodeNarrationClip({
        cleanWavPath: prepared.cleanWavPath,
        outputPath,
        durationSeconds: canonicalDurationSeconds,
        targets: registry.audioTargets,
      });
      await removePreparedClip(prepared);
      const track = tracks.get(voice.id);
      const firstCueIndex = track.cues.length + 1;
      const cues = cueTiming({
        text: scene.narrationText,
        audioSeconds: prepared.cleanedDurationSeconds,
        sceneStartSeconds: timelineSeconds,
        fps: video.fps,
        firstIndex: firstCueIndex,
      });
      track.cues.push(...cues);
      track.scenes.push({
        id: scene.id,
        audioPath: `${publicAudioBase}/${voice.id}/${scene.id}.m4a`,
        audioSeconds: prepared.cleanedDurationSeconds,
        durationSeconds: canonicalDurationSeconds,
        durationInFrames,
        startSeconds: timelineSeconds,
        startFrame: timelineFrames,
      });
      track.qc.push({
        sceneId: scene.id,
        sourcePeakDbfs: prepared.sourcePeakDbfs,
        sourceRmsDbfs: prepared.sourceRmsDbfs,
        sourceNoiseFloorDbfs: prepared.sourceNoiseFloorDbfs,
        dcOffsetRemoved: prepared.dcOffsetRemoved,
        clippedSamples: prepared.clippedSamples,
        trimmedStartSeconds: prepared.trimmedStartSeconds,
        trimmedEndSeconds: prepared.trimmedEndSeconds,
        integratedLufs: encoded.integratedLufs,
        truePeakDb: encoded.truePeakDb,
        loudnessRange: encoded.loudnessRange,
        clippingPassed: encoded.clippingPassed,
        loudnessPassed: encoded.loudnessPassed,
      });
    }));

    canonicalScenes.push({
      id: scene.id,
      durationSeconds: canonicalDurationSeconds,
      durationInFrames,
      startSeconds: timelineSeconds,
      startFrame: timelineFrames,
    });
    timelineSeconds += canonicalDurationSeconds;
    timelineFrames += durationInFrames;
  }

  const voiceTracks = registry.voices.map((voice) => {
    const track = tracks.get(voice.id);
    const captionFilename = `${video.slug}-${voice.id}.srt`;
    return {
      ...track,
      captionsFile: captionFilename,
    };
  });

  await Promise.all(
    voiceTracks.map((track) =>
      writeFile(path.join(outputDirectory, track.captionsFile), srt(track.cues)),
    ),
  );

  const transcript = [
    `# ${video.title}`,
    "",
    ...video.scenes.flatMap((scene) => [
      `## ${scene.display.title}`,
      "",
      scene.narrationText,
      "",
    ]),
  ].join("\n");
  await writeFile(
    path.join(outputDirectory, `${video.slug}-transcript.md`),
    `${transcript.trim()}\n`,
  );

  return {
    version: 3,
    slug: video.slug,
    compositionId: video.compositionId,
    fps: video.fps,
    totalFrames: timelineFrames,
    totalSeconds: timelineSeconds,
    defaultVoiceId: registry.defaultVoiceId,
    audioTargets: registry.audioTargets,
    scenes: canonicalScenes,
    voiceTracks,
  };
};
