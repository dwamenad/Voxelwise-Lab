import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { getVideoMetadata } from "@remotion/renderer";
import { liveWalkthroughs } from "../content/live-walkthroughs.mjs";

const projectRoot = process.cwd();
const args = process.argv.slice(2);
const flags = new Set(args.filter((value) => value.startsWith("--")));
const requestedSlugs = args.filter((value) => !value.startsWith("--"));
const selected = requestedSlugs.length
  ? liveWalkthroughs.filter((item) => requestedSlugs.includes(item.slug))
  : liveWalkthroughs;
const requireGenerated = flags.has("--require-generated");
const requireAssets = flags.has("--require-assets");
const requireMasters = flags.has("--require-masters");
const errors = [];

const readJson = async (relativePath) =>
  JSON.parse(await readFile(path.join(projectRoot, relativePath), "utf8"));

const parseNarration = (markdown) =>
  markdown
    .split(/^## /m)
    .slice(1)
    .map((block) => {
      const [titleLine, ...bodyLines] = block.trim().split("\n");
      return {
        title: titleLine.replace(/^\d+\.\s*/, "").trim(),
        narrationText: bodyLines.join("\n").replace(/\n{2,}/g, "\n\n").trim(),
      };
    });

if (selected.length !== (requestedSlugs.length || liveWalkthroughs.length)) {
  const found = new Set(selected.map((item) => item.slug));
  for (const slug of requestedSlugs) {
    if (!found.has(slug)) errors.push(`Unknown walkthrough slug: ${slug}`);
  }
}

if (liveWalkthroughs.length !== 13) {
  errors.push(`Expected 13 live walkthrough definitions; found ${liveWalkthroughs.length}.`);
}
const slugs = new Set();
const compositions = new Set();
for (const definition of liveWalkthroughs) {
  if (slugs.has(definition.slug)) errors.push(`${definition.slug}: duplicate slug.`);
  slugs.add(definition.slug);
  if (!definition.startState || !definition.endState) {
    errors.push(`${definition.slug}: capture startState and endState are required.`);
  }
  for (const compositionId of [definition.compositionId, definition.rawCompositionId]) {
    if (compositions.has(compositionId)) errors.push(`${definition.slug}: duplicate composition ID ${compositionId}.`);
    compositions.add(compositionId);
  }
}

const metadataText = await readFile(
  path.join(projectRoot, "production", "metadata", "live-walkthroughs.yaml"),
  "utf8",
);
const walkthroughMetadata = metadataText
  .split(/^walkthroughs:\s*$/m)[1]
  ?.split(/^quality_control:\s*$/m)[0] ?? "";
const metadataSlugs = [...walkthroughMetadata.matchAll(/^\s+slug:\s+([^\s]+)$/gm)].map(
  (match) => match[1],
);
const definitionSlugs = liveWalkthroughs.map((item) => item.slug);
if (JSON.stringify(metadataSlugs) !== JSON.stringify(definitionSlugs)) {
  errors.push("Live walkthrough source order does not match production/metadata/live-walkthroughs.yaml.");
}

const opening = await readJson("production/video/generated/walkthroughs/opening-feat.json");
const batch = await readJson("production/video/generated/walkthroughs/batch.json");
const generated = [opening, ...(batch.walkthroughs ?? [])];

const validateMaster = async ({ slug, filePath, expectedSeconds, raw = false }) => {
  try {
    const file = await stat(filePath);
    if (file.size === 0) {
      errors.push(`${slug}: ${raw ? "raw" : "review"} master is empty.`);
      return;
    }
    const media = await getVideoMetadata(filePath);
    if (media.width !== 1920 || media.height !== 1080) {
      errors.push(`${slug}: ${raw ? "raw" : "review"} master must be 1920x1080.`);
    }
    if (media.fps !== 30) errors.push(`${slug}: ${raw ? "raw" : "review"} master must be 30 fps.`);
    if (media.codec !== "h264") errors.push(`${slug}: ${raw ? "raw" : "review"} master must use H.264.`);
    if (!raw && media.audioCodec !== "aac") errors.push(`${slug}: review master must use AAC audio.`);
    if (!media.canPlayInVideoTag || !media.supportsSeeking) {
      errors.push(`${slug}: ${raw ? "raw" : "review"} master is not seekable browser-compatible media.`);
    }
    if (Math.abs(media.durationInSeconds - expectedSeconds) > 0.6) {
      errors.push(
        `${slug}: ${raw ? "raw" : "review"} duration ${media.durationInSeconds.toFixed(2)} does not match ${expectedSeconds.toFixed(2)} seconds.`,
      );
    }
  } catch (error) {
    errors.push(`${slug}: ${raw ? "raw" : "review"} master is missing or unreadable (${error.message}).`);
  }
};

for (const definition of selected) {
  const prefix = definition.slug;
  const narrationPath = path.join(projectRoot, "production", "narration", `${prefix}.md`);
  let narration = "";
  let narrationScenes = [];
  try {
    narration = await readFile(narrationPath, "utf8");
    narrationScenes = parseNarration(narration);
  } catch (error) {
    errors.push(`${prefix}: narration file is missing (${error.message}).`);
    continue;
  }
  if (narrationScenes.length !== definition.sections) {
    errors.push(`${prefix}: expected ${definition.sections} narration sections; found ${narrationScenes.length}.`);
  }
  if (narrationScenes.some((scene) => !scene.narrationText)) {
    errors.push(`${prefix}: every narration section must contain spoken copy.`);
  }

  const timing = generated.find((item) => item.slug === prefix);
  if (!timing) {
    if (requireGenerated) errors.push(`${prefix}: generated timing manifest is required.`);
    continue;
  }
  if (timing.compositionId !== definition.compositionId) {
    errors.push(`${prefix}: review composition ID does not match the source definition.`);
  }
  if (timing.rawCompositionId && timing.rawCompositionId !== definition.rawCompositionId) {
    errors.push(`${prefix}: raw composition ID does not match the source definition.`);
  }
  if (timing.voice !== "Daniel" || timing.speechRate !== 148) {
    errors.push(`${prefix}: narration must use Daniel at 148 words per minute.`);
  }
  if (timing.fps !== 30 || timing.captureFps !== 5 || timing.width !== 1920 || timing.height !== 1080) {
    errors.push(`${prefix}: generated media format metadata is incorrect.`);
  }
  if (timing.scenes?.length !== definition.sections) {
    errors.push(`${prefix}: generated scene count does not match the source definition.`);
  }
  if (timing.scenes?.some((scene, index) => scene.title !== narrationScenes[index]?.title)) {
    errors.push(`${prefix}: generated scene titles do not match the narration headings.`);
  }
  const calculatedFrames = (timing.scenes ?? []).reduce(
    (sum, scene) => sum + scene.durationInFrames,
    0,
  );
  if (calculatedFrames !== timing.totalFrames) {
    errors.push(`${prefix}: totalFrames does not equal the generated scene durations.`);
  }
  for (const cue of timing.cues ?? []) {
    const lines = cue.text.split("\n");
    if (lines.length > 2) errors.push(`${prefix}: caption exceeds two lines: ${cue.text}`);
    if (lines.some((line) => line.length > 42)) {
      errors.push(`${prefix}: caption line exceeds 42 characters: ${cue.text}`);
    }
    if (cue.endFrame <= cue.startFrame) errors.push(`${prefix}: caption cue has a non-positive duration.`);
  }

  const outputRoot = path.join(
    projectRoot,
    "production",
    "video",
    "output",
    "walkthroughs",
    prefix,
  );
  try {
    const transcript = await readFile(path.join(outputRoot, `${prefix}-transcript.md`), "utf8");
    if (transcript.trim() !== narration.trim()) {
      errors.push(`${prefix}: transcript does not match the canonical narration file.`);
    }
    await access(path.join(outputRoot, `${prefix}.srt`));
  } catch (error) {
    errors.push(`${prefix}: generated transcript or SRT is missing (${error.message}).`);
  }

  if (requireAssets) {
    for (const scene of timing.scenes ?? []) {
      const audioPath = path.join(projectRoot, "public", scene.audioPath);
      try {
        const audio = await stat(audioPath);
        if (audio.size === 0) errors.push(`${prefix}/${scene.id}: narration audio is empty.`);
      } catch {
        errors.push(`${prefix}/${scene.id}: narration audio is missing.`);
      }
      for (const visualScene of scene.visualScenes ?? []) {
        const firstFrame = path.join(
          projectRoot,
          "public",
          visualScene.assetRoot,
          "00000.png",
        );
        try {
          await access(firstFrame);
        } catch {
          errors.push(`${prefix}/${visualScene.id}: first authenticated capture frame is missing.`);
        }
      }
    }
  }

  if (requireMasters) {
    await validateMaster({
      slug: prefix,
      filePath: path.join(outputRoot, `${prefix}-review.mp4`),
      expectedSeconds: timing.totalSeconds,
    });
    const rawFrames = timing.rawTotalFrames ??
      (timing.scenes ?? [])
        .flatMap((scene) => scene.visualScenes ?? [])
        .reduce((sum, scene) => sum + scene.frameCount, 0) * (30 / timing.captureFps);
    await validateMaster({
      slug: prefix,
      filePath: path.join(outputRoot, `${prefix}-raw.mp4`),
      expectedSeconds: rawFrames / 30,
      raw: true,
    });
  }
}

if (errors.length) {
  console.error(`Live walkthrough validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Validated ${selected.length} live walkthrough source definition(s)${requireGenerated ? ", generated manifests" : ""}${requireAssets ? ", authenticated assets" : ""}${requireMasters ? ", and masters" : ""}.`,
);
