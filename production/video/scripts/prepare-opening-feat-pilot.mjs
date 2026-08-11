import { execFile } from "node:child_process";
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
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
const slug = "opening-feat";
const fps = 30;
const captureFps = 5;
const voice = "Daniel";
const speechRate = 148;
const defaultCaptureRoot = path.resolve(projectRoot, "..", "pilot-raw", slug);
const captureRoot = path.resolve(
  process.argv[2] ?? process.env.LIVE_CAPTURE_ROOT ?? defaultCaptureRoot,
);
const narrationPath = path.join(projectRoot, "production", "narration", `${slug}.md`);
const publicRoot = path.join(
  projectRoot,
  "public",
  "video-production",
  "walkthroughs",
  slug,
);
const audioRoot = path.join(publicRoot, "audio");
const frameRoot = path.join(publicRoot, "frames");
const outputRoot = path.join(
  projectRoot,
  "production",
  "video",
  "output",
  "walkthroughs",
  slug,
);
const generatedPath = path.join(
  projectRoot,
  "production",
  "video",
  "generated",
  "walkthroughs",
  `${slug}.json`,
);

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
  throw new Error(
    `Expected ${visualGroups.length} narration sections, found ${narrationScenes.length}.`,
  );
}

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
  const frameFiles = (await readdir(sourceDirectory))
    .filter((file) => file.endsWith(".png"))
    .sort();
  if (frameFiles.length === 0) {
    throw new Error(`No PNG frames found in ${sourceDirectory}`);
  }
  const targetDirectory = path.join(frameRoot, sceneName);
  await mkdir(targetDirectory, { recursive: true });
  await Promise.all(
    frameFiles.map((file) =>
      copyFile(path.join(sourceDirectory, file), path.join(targetDirectory, file)),
    ),
  );
  visualSceneMetadata.set(sceneName, {
    id: sceneName,
    assetRoot: `video-production/walkthroughs/${slug}/frames/${sceneName}`,
    frameCount: frameFiles.length,
  });
}

let timelineSeconds = 0;
let timelineFrames = 0;
let cueIndex = 1;
const sceneTiming = [];
const cues = [];
const srtBlocks = [];

for (const [sceneIndex, scene] of narrationScenes.entries()) {
  const aiffPath = path.join(audioRoot, `${scene.id}.aiff`);
  const m4aPath = path.join(audioRoot, `${scene.id}.m4a`);
  await Promise.all([rm(aiffPath, { force: true }), rm(m4aPath, { force: true })]);
  await run("say", [
    "-v",
    voice,
    "-r",
    String(speechRate),
    "-o",
    aiffPath,
    toTtsText(scene.narrationText),
  ]);
  await run("afconvert", [aiffPath, m4aPath, "-f", "m4af", "-d", "aac "]);
  const { stdout } = await run("afinfo", [m4aPath]);
  const audioSeconds = parseDuration(stdout);
  const padSeconds = 0.85;
  const durationSeconds = audioSeconds + padSeconds;
  const durationInFrames = Math.ceil(durationSeconds * fps);
  const captionTexts = splitCaptionCues(scene.narrationText);
  const totalWords = captionTexts.reduce((sum, cue) => sum + wordCount(cue), 0);
  let cueOffset = 0;

  for (const captionText of captionTexts) {
    const cueDuration = audioSeconds * (wordCount(captionText) / totalWords);
    const startSeconds = timelineSeconds + cueOffset;
    const endSeconds = startSeconds + cueDuration;
    cues.push({
      index: cueIndex,
      text: captionText,
      startSeconds,
      endSeconds,
      startFrame: Math.floor(startSeconds * fps),
      endFrame: Math.ceil(endSeconds * fps),
    });
    srtBlocks.push(
      `${cueIndex}\n${formatTimestamp(startSeconds)} --> ${formatTimestamp(endSeconds)}\n${captionText}`,
    );
    cueIndex += 1;
    cueOffset += cueDuration;
  }

  sceneTiming.push({
    id: scene.id,
    title: scene.title,
    audioPath: `video-production/walkthroughs/${slug}/audio/${scene.id}.m4a`,
    audioSeconds,
    durationSeconds,
    durationInFrames,
    startSeconds: timelineSeconds,
    startFrame: timelineFrames,
    visualScenes: visualGroups[sceneIndex].map((sceneName) =>
      visualSceneMetadata.get(sceneName),
    ),
  });
  timelineSeconds += durationSeconds;
  timelineFrames += durationInFrames;
  await rm(aiffPath, { force: true });
}

const manifest = {
  version: 1,
  slug,
  compositionId: "OpeningFeatWalkthrough",
  fps,
  captureFps,
  width: 1920,
  height: 1080,
  totalFrames: timelineFrames,
  totalSeconds: timelineSeconds,
  voice,
  speechRate,
  scenes: sceneTiming,
  cues,
};

await Promise.all([
  writeFile(generatedPath, `${JSON.stringify(manifest, null, 2)}\n`),
  writeFile(
    path.join(outputRoot, `${slug}.srt`),
    `${srtBlocks.join("\n\n")}\n`,
  ),
  writeFile(
    path.join(outputRoot, `${slug}-transcript.md`),
    `${markdown.trim()}\n`,
  ),
]);

console.log(
  `Prepared ${slug}: ${timelineSeconds.toFixed(1)} seconds, ${timelineFrames} frames, ${visualSceneMetadata.size} authentic capture scenes.`,
);
