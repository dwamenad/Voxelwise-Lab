import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  formatTimestamp,
  parseDuration,
  splitCaptionCues,
  toTtsText,
  wordCount,
} from "./narration-utils.mjs";

const run = promisify(execFile);
const projectRoot = process.cwd();
const contentPath = path.join(projectRoot, "production", "video", "content", "concept-library.json");
const generatedPath = path.join(projectRoot, "production", "video", "generated", "concept-library.json");
const outputRoot = path.join(projectRoot, "production", "video", "output", "concepts", "v2");
const library = JSON.parse(await readFile(contentPath, "utf8"));

const seenSlugs = new Set();
const seenCompositionIds = new Set();
const generatedVideos = [];

for (const video of library.videos) {
  if (seenSlugs.has(video.slug)) throw new Error(`Duplicate video slug: ${video.slug}`);
  if (seenCompositionIds.has(video.compositionId)) {
    throw new Error(`Duplicate composition ID: ${video.compositionId}`);
  }
  seenSlugs.add(video.slug);
  seenCompositionIds.add(video.compositionId);

  const audioDirectory = path.join(
    projectRoot,
    "public",
    "video-production",
    video.slug,
    "audio-v2",
  );
  const outputDirectory = path.join(outputRoot, video.slug);
  await Promise.all([
    mkdir(audioDirectory, { recursive: true }),
    mkdir(outputDirectory, { recursive: true }),
    mkdir(path.dirname(generatedPath), { recursive: true }),
  ]);

  let timelineSeconds = 0;
  let timelineFrames = 0;
  let cueIndex = 1;
  const sceneTiming = [];
  const cues = [];
  const srtBlocks = [];

  for (const scene of video.scenes) {
    const narrationText = scene.narrationText;
    if (!narrationText) throw new Error(`Missing narrationText: ${video.slug}/${scene.id}`);

    const aiffPath = path.join(audioDirectory, `${scene.id}.aiff`);
    const m4aPath = path.join(audioDirectory, `${scene.id}.m4a`);
    await Promise.all([rm(aiffPath, { force: true }), rm(m4aPath, { force: true })]);
    await run("say", [
      "-v",
      video.voice,
      "-r",
      String(video.speechRate),
      "-o",
      aiffPath,
      toTtsText(narrationText),
    ]);
    await run("afconvert", [aiffPath, m4aPath, "-f", "m4af", "-d", "aac "]);
    const { stdout } = await run("afinfo", [m4aPath]);
    const audioSeconds = parseDuration(stdout);
    const padSeconds = 0.85;
    const durationSeconds = audioSeconds + padSeconds;
    const durationInFrames = Math.ceil(durationSeconds * video.fps);
    const captionTexts = splitCaptionCues(narrationText);
    const totalWords = captionTexts.reduce((sum, cue) => sum + wordCount(cue), 0);
    let cueOffset = 0;

    for (const captionText of captionTexts) {
      const cueDuration = audioSeconds * (wordCount(captionText) / totalWords);
      const startSeconds = timelineSeconds + cueOffset;
      const endSeconds = startSeconds + cueDuration;
      const cue = {
        index: cueIndex,
        text: captionText,
        startSeconds,
        endSeconds,
        startFrame: Math.floor(startSeconds * video.fps),
        endFrame: Math.ceil(endSeconds * video.fps),
      };
      cues.push(cue);
      srtBlocks.push(
        `${cueIndex}\n${formatTimestamp(startSeconds)} --> ${formatTimestamp(endSeconds)}\n${captionText}`,
      );
      cueIndex += 1;
      cueOffset += cueDuration;
    }

    sceneTiming.push({
      id: scene.id,
      audioPath: `video-production/${video.slug}/audio-v2/${scene.id}.m4a`,
      audioSeconds,
      durationSeconds,
      durationInFrames,
      startSeconds: timelineSeconds,
      startFrame: timelineFrames,
    });

    timelineSeconds += durationSeconds;
    timelineFrames += durationInFrames;
    await rm(aiffPath, { force: true });
  }

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

  await Promise.all([
    writeFile(path.join(outputDirectory, `${video.slug}.srt`), `${srtBlocks.join("\n\n")}\n`),
    writeFile(path.join(outputDirectory, `${video.slug}-transcript.md`), `${transcript.trim()}\n`),
  ]);

  generatedVideos.push({
    slug: video.slug,
    compositionId: video.compositionId,
    fps: video.fps,
    totalFrames: timelineFrames,
    totalSeconds: timelineSeconds,
    voice: video.voice,
    speechRate: video.speechRate,
    scenes: sceneTiming,
    cues,
  });

  console.log(`${video.slug}: ${timelineSeconds.toFixed(1)} seconds`);
}

await writeFile(
  generatedPath,
  `${JSON.stringify({ version: library.version, videos: generatedVideos }, null, 2)}\n`,
);

const totalSeconds = generatedVideos.reduce((sum, video) => sum + video.totalSeconds, 0);
console.log(
  `Generated ${generatedVideos.length} v2 videos (${(totalSeconds / 60).toFixed(1)} total minutes).`,
);
