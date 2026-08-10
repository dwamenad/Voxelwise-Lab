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
const contentPath = path.resolve(
  projectRoot,
  process.argv[2] ?? "production/video/content/understanding-contrasts.json",
);
const content = JSON.parse(await readFile(contentPath, "utf8"));
const audioDirectory = path.join(
  projectRoot,
  "public",
  "video-production",
  content.slug,
  "audio-v2",
);
const generatedDirectory = path.join(projectRoot, "production", "video", "generated");
const outputDirectory = path.join(
  projectRoot,
  "production",
  "video",
  "output",
  "v2",
  content.slug,
);

await Promise.all([
  mkdir(audioDirectory, { recursive: true }),
  mkdir(generatedDirectory, { recursive: true }),
  mkdir(outputDirectory, { recursive: true }),
]);

let timelineSeconds = 0;
let timelineFrames = 0;
let cueIndex = 1;
const sceneTiming = [];
const cues = [];
const srtBlocks = [];

for (const scene of content.scenes) {
  const narrationText = scene.narrationText;
  if (!narrationText) throw new Error(`Missing narrationText: ${content.slug}/${scene.id}`);

  const aiffPath = path.join(audioDirectory, `${scene.id}.aiff`);
  const m4aPath = path.join(audioDirectory, `${scene.id}.m4a`);

  await Promise.all([rm(aiffPath, { force: true }), rm(m4aPath, { force: true })]);
  await run("say", [
    "-v",
    content.voice,
    "-r",
    String(content.speechRate),
    "-o",
    aiffPath,
    toTtsText(narrationText),
  ]);
  await run("afconvert", [aiffPath, m4aPath, "-f", "m4af", "-d", "aac "]);
  const { stdout } = await run("afinfo", [m4aPath]);
  const audioSeconds = parseDuration(stdout);
  const padSeconds = 0.85;
  const durationSeconds = audioSeconds + padSeconds;
  const durationInFrames = Math.ceil(durationSeconds * content.fps);
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
      startFrame: Math.floor(startSeconds * content.fps),
      endFrame: Math.ceil(endSeconds * content.fps),
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
    audioPath: `video-production/${content.slug}/audio-v2/${scene.id}.m4a`,
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

const manifest = {
  version: content.version,
  slug: content.slug,
  compositionId: content.compositionId,
  fps: content.fps,
  totalFrames: timelineFrames,
  totalSeconds: timelineSeconds,
  voice: content.voice,
  speechRate: content.speechRate,
  scenes: sceneTiming,
  cues,
};

const transcript = [
  `# ${content.title}`,
  "",
  ...content.scenes.flatMap((scene) => [
    `## ${scene.display.title}`,
    "",
    scene.narrationText,
    "",
  ]),
].join("\n");

await Promise.all([
  writeFile(
    path.join(generatedDirectory, `${content.slug}.json`),
    `${JSON.stringify(manifest, null, 2)}\n`,
  ),
  writeFile(
    path.join(outputDirectory, `${content.slug}.srt`),
    `${srtBlocks.join("\n\n")}\n`,
  ),
  writeFile(
    path.join(outputDirectory, `${content.slug}-transcript.md`),
    `${transcript.trim()}\n`,
  ),
]);

console.log(
  `Generated ${sceneTiming.length} v2 narration clips (${timelineSeconds.toFixed(1)} seconds).`,
);
