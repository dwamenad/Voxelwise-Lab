import { execFile } from "node:child_process";
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { getLiveWalkthrough, liveWalkthroughs } from "../content/live-walkthroughs.mjs";
import {
  formatTimestamp,
  parseDuration,
  splitCaptionCues,
  toTtsText,
  wordCount,
} from "./narration-utils.mjs";

const run = promisify(execFile);
const fps = 30;
const captureFps = 5;
const voice = "Daniel";
const speechRate = 148;

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const parseNarrationScenes = (markdown) =>
  markdown
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

const generatedCaptureGroups = (scenes) =>
  scenes.map((scene, index) => [
    `${String(index + 1).padStart(2, "0")}-${slugify(scene.title)}`,
  ]);

export async function getWalkthroughCaptureLayout({ slug, projectRoot = process.cwd() }) {
  const definition = getLiveWalkthrough(slug);
  if (!definition) {
    throw new Error(
      `Unknown walkthrough "${slug}". Expected one of: ${liveWalkthroughs.map((item) => item.slug).join(", ")}`,
    );
  }
  const narrationPath = path.join(projectRoot, "production", "narration", `${slug}.md`);
  const narrationScenes = parseNarrationScenes(await readFile(narrationPath, "utf8"));
  return {
    definition,
    narrationScenes,
    visualGroups: definition.visualGroups ?? generatedCaptureGroups(narrationScenes),
  };
}

const readBatchRegistry = async (batchPath) => {
  try {
    return JSON.parse(await readFile(batchPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return { version: 1, walkthroughs: [] };
    throw error;
  }
};

export async function prepareLiveWalkthrough({
  slug,
  captureRootArgument,
  projectRoot = process.cwd(),
}) {
  const { definition, narrationScenes, visualGroups } =
    await getWalkthroughCaptureLayout({ slug, projectRoot });

  const defaultCaptureRoot = definition.slug === "opening-feat"
    ? path.resolve(projectRoot, "..", "pilot-raw", slug)
    : path.resolve(projectRoot, "..", "walkthrough-captures", slug);
  const captureRoot = path.resolve(
    captureRootArgument ?? process.env.LIVE_CAPTURE_ROOT ?? defaultCaptureRoot,
  );
  const narrationPath = path.join(projectRoot, "production", "narration", `${slug}.md`);
  const publicRoot = path.join(
    projectRoot,
    "public",
    "video-production",
    "walkthroughs",
    slug,
  );
  if (captureRoot === publicRoot || captureRoot.startsWith(`${publicRoot}${path.sep}`)) {
    throw new Error(`${slug}: capture input must not be inside the generated public asset directory.`);
  }
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
  const generatedRoot = path.join(
    projectRoot,
    "production",
    "video",
    "generated",
    "walkthroughs",
  );
  const generatedPath = path.join(generatedRoot, `${slug}.json`);
  const batchPath = path.join(generatedRoot, "batch.json");

  const markdown = await readFile(narrationPath, "utf8");
  if (narrationScenes.length !== definition.sections) {
    throw new Error(
      `${slug}: expected ${definition.sections} narration sections, found ${narrationScenes.length}.`,
    );
  }
  if (narrationScenes.some((scene) => !scene.narrationText)) {
    throw new Error(`${slug}: every narration section must contain spoken copy.`);
  }

  const captureSources = new Map();
  for (const sceneName of visualGroups.flat()) {
    const sourceDirectory = path.join(captureRoot, sceneName);
    const frameFiles = (await readdir(sourceDirectory))
      .filter((file) => file.toLowerCase().endsWith(".png"))
      .sort();
    if (frameFiles.length === 0) {
      throw new Error(`No PNG frames found in ${sourceDirectory}`);
    }
    captureSources.set(sceneName, { sourceDirectory, frameFiles });
  }

  await Promise.all([
    mkdir(audioRoot, { recursive: true }),
    mkdir(outputRoot, { recursive: true }),
    mkdir(generatedRoot, { recursive: true }),
  ]);
  await rm(frameRoot, { recursive: true, force: true });
  await mkdir(frameRoot, { recursive: true });

  const visualSceneMetadata = new Map();
  for (const sceneName of visualGroups.flat()) {
    const { sourceDirectory, frameFiles } = captureSources.get(sceneName);
    const targetDirectory = path.join(frameRoot, sceneName);
    await mkdir(targetDirectory, { recursive: true });
    await Promise.all(
      frameFiles.map((file, index) =>
        copyFile(
          path.join(sourceDirectory, file),
          path.join(targetDirectory, `${String(index).padStart(5, "0")}.png`),
        ),
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

  const rawSourceFrames = [...visualSceneMetadata.values()].reduce(
    (sum, scene) => sum + scene.frameCount,
    0,
  );
  const manifest = {
    version: 1,
    slug,
    title: definition.title,
    compositionId: definition.compositionId,
    rawCompositionId: definition.rawCompositionId,
    fps,
    captureFps,
    width: 1920,
    height: 1080,
    totalFrames: timelineFrames,
    totalSeconds: timelineSeconds,
    rawSourceFrames,
    rawTotalFrames: Math.ceil(rawSourceFrames * (fps / captureFps)),
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

  if (slug !== "opening-feat") {
    const batch = await readBatchRegistry(batchPath);
    batch.version = 1;
    batch.walkthroughs = [
      ...(batch.walkthroughs ?? []).filter((item) => item.slug !== slug),
      manifest,
    ].sort(
      (left, right) =>
        liveWalkthroughs.findIndex((item) => item.slug === left.slug) -
        liveWalkthroughs.findIndex((item) => item.slug === right.slug),
    );
    await writeFile(batchPath, `${JSON.stringify(batch, null, 2)}\n`);
  }

  console.log(
    `Prepared ${slug}: ${timelineSeconds.toFixed(1)} seconds, ${timelineFrames} frames, ${visualSceneMetadata.size} authentic capture scenes.`,
  );
  return manifest;
}

const isDirectRun = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirectRun) {
  const cliArgs = process.argv.slice(2);
  const printLayout = cliArgs.includes("--print-layout");
  const positional = cliArgs.filter((value) => !value.startsWith("--"));
  const [slug, captureRootArgument] = positional;
  if (!slug) {
    throw new Error(
      `Usage: node production/video/scripts/prepare-live-walkthrough.mjs <slug> [capture-root] [--print-layout]`,
    );
  }
  if (printLayout) {
    const { narrationScenes, visualGroups } = await getWalkthroughCaptureLayout({ slug });
    console.log(`${slug} capture layout:`);
    narrationScenes.forEach((scene, index) => {
      console.log(`- ${scene.title}`);
      visualGroups[index].forEach((directory) => console.log(`  ${directory}/`));
    });
  } else {
    await prepareLiveWalkthrough({ slug, captureRootArgument });
  }
}
