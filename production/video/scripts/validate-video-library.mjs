import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { getVideoMetadata } from "@remotion/renderer";

const projectRoot = process.cwd();
const requireConceptGenerated = process.argv.includes("--require-concept-generated");
const requireContrastGenerated = process.argv.includes("--require-contrast-generated");
const requireMasters = process.argv.includes("--require-masters");
const errors = [];

const readJson = async (relativePath) =>
  JSON.parse(await readFile(path.join(projectRoot, relativePath), "utf8"));

const conceptLibrary = await readJson("production/video/content/concept-library.json");
const contrast = await readJson("production/video/content/understanding-contrasts.json");
const videos = [...conceptLibrary.videos, contrast];

const words = (value = "") => value.trim().split(/\s+/).filter(Boolean).length;
const visibleSceneText = (scene) =>
  JSON.stringify({
    display: scene.display,
    visual: scene.visual,
    narrationText: scene.narrationText,
  });
const learnerFacingBan =
  /(David\s+V\.?\s*Smith|tubric\/|source lab|repository source|renderer|composition|concept video|connect concept to evidence|observable check|educational scope|carry the reasoning|acknowledg(e)?ment)/i;
const pronunciationLeak = /\b(?:F S L|M R I|G L M|H R F|E V|T R|F S F)\b/;
const validLayouts = new Set(["opening", "editorial", "diagram", "evidence", "dashboard", "summary"]);
const validVisuals = new Set([
  "tool-map",
  "learning-loop",
  "route-map",
  "terminal-anatomy",
  "filesystem-tree",
  "nifti-stack",
  "bids-tree",
  "image-evidence",
  "metadata-stats",
  "mask-measure",
  "analysis-levels",
  "glm",
  "timing-strip",
  "ev-columns",
  "hrf-convolution",
  "confound-separation",
  "feat-chain",
  "contrast-weights",
  "comparison",
  "checklist",
  "code",
]);

if (conceptLibrary.version !== 2) errors.push("Concept library must be version 2.");
if (contrast.version !== 2) errors.push("Understanding contrasts must be version 2.");
if (conceptLibrary.editorialPolicy?.learnerCreditsEnabled !== false) {
  errors.push("Concept-library learner credits must remain disabled.");
}
if (conceptLibrary.editorialPolicy?.acknowledgementSlideEnabled !== false) {
  errors.push("Concept-library acknowledgement slide must remain disabled.");
}
if (conceptLibrary.videos.length !== 18) {
  errors.push(`Expected 18 concept-library videos; found ${conceptLibrary.videos.length}.`);
}
if (videos.length !== 19) errors.push(`Expected 19 total videos; found ${videos.length}.`);

const slugs = new Set();
const compositions = new Set();
for (const video of videos) {
  const prefix = video.slug ?? "unknown-video";
  if (slugs.has(video.slug)) errors.push(`${prefix}: duplicate slug.`);
  if (compositions.has(video.compositionId)) errors.push(`${prefix}: duplicate composition ID.`);
  slugs.add(video.slug);
  compositions.add(video.compositionId);

  if (video.voice !== "Daniel" || video.speechRate !== 148) {
    errors.push(`${prefix}: production voice must be Daniel at 148 words per minute.`);
  }
  if (video.fps !== 30) errors.push(`${prefix}: frame rate must be 30 fps.`);
  if (video.source?.visibility !== "internal") {
    errors.push(`${prefix}: top-level source metadata must be internal.`);
  }
  if (video.editorialPolicy) {
    if (video.editorialPolicy.learnerCreditsEnabled !== false) {
      errors.push(`${prefix}: learner credits must remain disabled.`);
    }
    if (video.editorialPolicy.acknowledgementSlideEnabled !== false) {
      errors.push(`${prefix}: acknowledgement slide must remain disabled.`);
    }
  }

  for (const scene of video.scenes ?? []) {
    const id = `${prefix}/${scene.id ?? "unknown-scene"}`;
    if (!validLayouts.has(scene.layout)) errors.push(`${id}: invalid layout ${scene.layout}.`);
    if (!scene.display?.eyebrow || !scene.display?.title) {
      errors.push(`${id}: display eyebrow and title are required.`);
    }
    if (words(scene.display?.title) > 12) errors.push(`${id}: title exceeds 12 words.`);
    if (words(scene.display?.body) > 28) errors.push(`${id}: body exceeds 28 words.`);
    if ((scene.display?.bullets?.length ?? 0) > 3) errors.push(`${id}: more than 3 bullets.`);
    for (const bullet of scene.display?.bullets ?? []) {
      if (words(bullet) > 8) errors.push(`${id}: bullet exceeds 8 words: ${bullet}`);
    }
    if (!scene.narrationText) errors.push(`${id}: narrationText is required.`);
    if (pronunciationLeak.test(scene.narrationText ?? "")) {
      errors.push(`${id}: TTS pronunciation spelling leaked into canonical narration.`);
    }
    const visible = visibleSceneText(scene);
    const banned = visible.match(learnerFacingBan)?.[0];
    if (banned) errors.push(`${id}: learner-facing internal language found: ${banned}`);
    if (scene.visual && !validVisuals.has(scene.visual.type)) {
      errors.push(`${id}: invalid visual type ${scene.visual.type}.`);
    }
    if (!scene.sourceRefs?.length) errors.push(`${id}: internal source reference is required.`);
    for (const sourceRef of scene.sourceRefs ?? []) {
      if (sourceRef.visibility !== "internal") {
        errors.push(`${id}: every source reference must be internal.`);
      }
    }
    for (const asset of [scene.visual?.asset, scene.visual?.assetSecondary].filter(Boolean)) {
      const assetPath = path.join(projectRoot, "public", asset.replace(/^\//, ""));
      try {
        await access(assetPath);
      } catch {
        errors.push(`${id}: visual asset does not exist: ${asset}`);
      }
    }
  }
}

const validateGeneratedVideo = async ({ video, timing, outputDirectory }) => {
  const prefix = video.slug;
  if (!timing) {
    errors.push(`${prefix}: generated timing is missing.`);
    return;
  }
  if (timing.voice !== "Daniel" || timing.speechRate !== 148) {
    errors.push(`${prefix}: generated voice metadata is incorrect.`);
  }
  if (timing.scenes?.length !== video.scenes.length) {
    errors.push(`${prefix}: generated scene count does not match content.`);
  }
  for (const scene of timing.scenes ?? []) {
    const audioPath = path.join(projectRoot, "public", scene.audioPath);
    try {
      const file = await stat(audioPath);
      if (file.size === 0) errors.push(`${prefix}/${scene.id}: audio file is empty.`);
    } catch {
      errors.push(`${prefix}/${scene.id}: audio file is missing.`);
    }
  }
  for (const cue of timing.cues ?? []) {
    const lines = cue.text.split("\n");
    if (lines.length > 2) errors.push(`${prefix}: caption cue exceeds 2 lines: ${cue.text}`);
    if (lines.some((line) => line.length > 42)) {
      errors.push(`${prefix}: caption line exceeds 42 characters: ${cue.text}`);
    }
    if (pronunciationLeak.test(cue.text)) {
      errors.push(`${prefix}: TTS pronunciation spelling leaked into captions.`);
    }
    const banned = cue.text.match(learnerFacingBan)?.[0];
    if (banned) errors.push(`${prefix}: learner-facing internal language found in captions: ${banned}`);
  }

  for (const suffix of [".srt", "-transcript.md"]) {
    const filePath = path.join(outputDirectory, `${prefix}${suffix}`);
    try {
      const fileText = await readFile(filePath, "utf8");
      if (pronunciationLeak.test(fileText)) {
        errors.push(`${prefix}: TTS pronunciation spelling leaked into ${suffix}.`);
      }
      const banned = fileText.match(learnerFacingBan)?.[0];
      if (banned) errors.push(`${prefix}: learner-facing internal language found in ${suffix}: ${banned}`);
      if (/^Source:/m.test(fileText)) errors.push(`${prefix}: learner-facing source footer found in ${suffix}.`);
    } catch {
      errors.push(`${prefix}: missing generated ${suffix}.`);
    }
  }
};

if (requireConceptGenerated) {
  const generated = await readJson("production/video/generated/concept-library.json");
  if (generated.version !== 2) errors.push("Generated concept timing must be version 2.");
  for (const video of conceptLibrary.videos) {
    await validateGeneratedVideo({
      video,
      timing: generated.videos.find((item) => item.slug === video.slug),
      outputDirectory: path.join(
        projectRoot,
        "production",
        "video",
        "output",
        "concepts",
        "v2",
        video.slug,
      ),
    });
  }
}

if (requireContrastGenerated) {
  const generated = await readJson("production/video/generated/understanding-contrasts.json");
  await validateGeneratedVideo({
    video: contrast,
    timing: generated,
    outputDirectory: path.join(
      projectRoot,
      "production",
      "video",
      "output",
      "v2",
      contrast.slug,
    ),
  });
}

if (requireMasters) {
  const conceptGenerated = await readJson("production/video/generated/concept-library.json");
  const contrastGenerated = await readJson("production/video/generated/understanding-contrasts.json");
  const validateMaster = async ({ slug, masterPath, expectedSeconds }) => {
    try {
      const file = await stat(masterPath);
      if (file.size === 0) {
        errors.push(`${slug}: v2 master is empty.`);
        return;
      }
      const metadata = await getVideoMetadata(masterPath);
      if (metadata.width !== 1920 || metadata.height !== 1080) {
        errors.push(`${slug}: master must be 1920x1080.`);
      }
      if (metadata.fps !== 30) errors.push(`${slug}: master must be 30 fps.`);
      if (metadata.codec !== "h264") errors.push(`${slug}: master video codec must be H.264.`);
      if (metadata.audioCodec !== "aac") errors.push(`${slug}: master audio codec must be AAC.`);
      if (!metadata.canPlayInVideoTag || !metadata.supportsSeeking) {
        errors.push(`${slug}: master is not seekable browser-compatible media.`);
      }
      if (Math.abs(metadata.durationInSeconds - expectedSeconds) > 0.5) {
        errors.push(
          `${slug}: encoded duration ${metadata.durationInSeconds.toFixed(2)} does not match generated duration ${expectedSeconds.toFixed(2)}.`,
        );
      }
    } catch (error) {
      errors.push(`${slug}: v2 master is missing or unreadable (${error.message}).`);
    }
  };

  for (const video of conceptLibrary.videos) {
    const masterPath = path.join(
      projectRoot,
      "production",
      "video",
      "output",
      "concepts",
      "masters-v2",
      `${video.slug}.mp4`,
    );
    const timing = conceptGenerated.videos.find((item) => item.slug === video.slug);
    await validateMaster({
      slug: video.slug,
      masterPath,
      expectedSeconds: timing.totalSeconds,
    });
  }
  const contrastMaster = path.join(
    projectRoot,
    "production",
    "video",
    "output",
    "understanding-contrasts-v2.mp4",
  );
  await validateMaster({
    slug: contrast.slug,
    masterPath: contrastMaster,
    expectedSeconds: contrastGenerated.totalSeconds,
  });
}

if (errors.length) {
  console.error(`Video validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Validated ${videos.length} v2 videos${requireMasters ? ", including masters" : ""}.`,
);
