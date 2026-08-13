import { spawn } from "node:child_process";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const library = JSON.parse(
  await readFile(path.join(projectRoot, "production", "video", "content", "concept-library.json"), "utf8"),
);
const timing = JSON.parse(
  await readFile(path.join(projectRoot, "production", "video", "generated", "concept-library.json"), "utf8"),
);
const voiceRegistry = JSON.parse(
  await readFile(path.join(projectRoot, "production", "video", "config", "voices.json"), "utf8"),
);
const voiceArgument = process.argv.find((argument) => argument.startsWith("--voices="));
const requestedVoiceIds = voiceArgument
  ? voiceArgument.slice("--voices=".length).split(",").filter(Boolean)
  : voiceRegistry.voices.map((voice) => voice.id);
const requestedSlugs = new Set(process.argv.slice(2).filter((argument) => !argument.startsWith("--voices=")));
const videos = library.videos.filter((video) => requestedSlugs.size === 0 || requestedSlugs.has(video.slug));

const knownVoiceIds = new Set(voiceRegistry.voices.map((voice) => voice.id));
const unknownVoices = requestedVoiceIds.filter((voiceId) => !knownVoiceIds.has(voiceId));
if (unknownVoices.length) throw new Error(`Unknown voice ID(s): ${unknownVoices.join(", ")}`);

if (requestedSlugs.size > 0 && videos.length !== requestedSlugs.size) {
  const known = new Set(videos.map((video) => video.slug));
  const missing = [...requestedSlugs].filter((slug) => !known.has(slug));
  throw new Error(`Unknown concept video slug(s): ${missing.join(", ")}`);
}

const compositionVoiceSuffix = (voiceId) => `${voiceId[0]?.toUpperCase() ?? ""}${voiceId.slice(1)}`;
const render = (video, voiceId, outputPath) =>
  new Promise((resolve, reject) => {
    const compositionId = voiceId === voiceRegistry.defaultVoiceId
      ? video.compositionId
      : `${video.compositionId}${compositionVoiceSuffix(voiceId)}`;
    const child = spawn(
      path.join(projectRoot, "node_modules", ".bin", "remotion"),
      [
        "render",
        "production/video/src/index.ts",
        compositionId,
        outputPath,
        "--codec=h264",
        "--crf=18",
        "--concurrency=8",
        "--overwrite",
        "--quiet",
        "--log=error",
      ],
      { cwd: projectRoot, stdio: "inherit" },
    );
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Remotion exited with code ${code} for ${video.slug}/${voiceId}`));
    });
  });

const outputDirectory = path.join(projectRoot, "production", "video", "output", "concepts", "masters-v3");
await mkdir(outputDirectory, { recursive: true });

const results = [];
const renderCount = videos.length * requestedVoiceIds.length;
let renderIndex = 0;
for (const video of videos) {
  const videoTiming = timing.videos.find((item) => item.slug === video.slug);
  if (!videoTiming) throw new Error(`Missing generated timing for ${video.slug}`);
  for (const voiceId of requestedVoiceIds) {
    renderIndex += 1;
    const voiceDirectory = path.join(outputDirectory, video.slug);
    await mkdir(voiceDirectory, { recursive: true });
    const outputPath = path.join(voiceDirectory, `${voiceId}.mp4`);
    console.log(`[${renderIndex}/${renderCount}] Rendering ${video.slug}/${voiceId} (${videoTiming.totalSeconds.toFixed(1)} seconds)`);
    const startedAt = Date.now();
    await render(video, voiceId, outputPath);
    const file = await stat(outputPath);
    results.push({
      slug: video.slug,
      voiceId,
      outputPath: path.relative(projectRoot, outputPath),
      durationSeconds: videoTiming.totalSeconds,
      sizeBytes: file.size,
      renderSeconds: (Date.now() - startedAt) / 1000,
    });
    console.log(`Completed ${video.slug}/${voiceId}: ${(file.size / 1_000_000).toFixed(1)} MB`);
  }
}

const totalBytes = results.reduce((sum, item) => sum + item.sizeBytes, 0);
console.log(`Rendered ${results.length} masters (${(totalBytes / 1_000_000).toFixed(1)} MB).`);
