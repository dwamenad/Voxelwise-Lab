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
const requestedSlugs = new Set(process.argv.slice(2));
const videos = library.videos.filter((video) => requestedSlugs.size === 0 || requestedSlugs.has(video.slug));

if (requestedSlugs.size > 0 && videos.length !== requestedSlugs.size) {
  const known = new Set(videos.map((video) => video.slug));
  const missing = [...requestedSlugs].filter((slug) => !known.has(slug));
  throw new Error(`Unknown concept video slug(s): ${missing.join(", ")}`);
}

const render = (video, outputPath) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      path.join(projectRoot, "node_modules", ".bin", "remotion"),
      [
        "render",
        "production/video/src/index.ts",
        video.compositionId,
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
      else reject(new Error(`Remotion exited with code ${code} for ${video.slug}`));
    });
  });

const outputDirectory = path.join(projectRoot, "production", "video", "output", "concepts", "masters-v2");
await mkdir(outputDirectory, { recursive: true });

const results = [];
for (const [index, video] of videos.entries()) {
  const videoTiming = timing.videos.find((item) => item.slug === video.slug);
  if (!videoTiming) throw new Error(`Missing generated timing for ${video.slug}`);
  const outputPath = path.join(outputDirectory, `${video.slug}.mp4`);
  console.log(`[${index + 1}/${videos.length}] Rendering ${video.slug} (${videoTiming.totalSeconds.toFixed(1)} seconds)`);
  const startedAt = Date.now();
  await render(video, outputPath);
  const file = await stat(outputPath);
  results.push({
    slug: video.slug,
    outputPath: path.relative(projectRoot, outputPath),
    durationSeconds: videoTiming.totalSeconds,
    sizeBytes: file.size,
    renderSeconds: (Date.now() - startedAt) / 1000,
  });
  console.log(`Completed ${video.slug}: ${(file.size / 1_000_000).toFixed(1)} MB`);
}

const totalBytes = results.reduce((sum, item) => sum + item.sizeBytes, 0);
console.log(`Rendered ${results.length} masters (${(totalBytes / 1_000_000).toFixed(1)} MB).`);
