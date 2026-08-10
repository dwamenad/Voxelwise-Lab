import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const outputRoot = path.join(
  projectRoot,
  "production",
  "video",
  "output",
  "review-v2",
);
const requestedSlugs = new Set(process.argv.slice(2));
const conceptLibrary = JSON.parse(
  await readFile(
    path.join(projectRoot, "production/video/content/concept-library.json"),
    "utf8",
  ),
);
const conceptTiming = JSON.parse(
  await readFile(
    path.join(projectRoot, "production/video/generated/concept-library.json"),
    "utf8",
  ),
);
const contrastVideo = JSON.parse(
  await readFile(
    path.join(projectRoot, "production/video/content/understanding-contrasts.json"),
    "utf8",
  ),
);
const contrastTiming = JSON.parse(
  await readFile(
    path.join(projectRoot, "production/video/generated/understanding-contrasts.json"),
    "utf8",
  ),
);

const reviewVideos = [
  ...conceptLibrary.videos.map((video) => ({
    video,
    timing: conceptTiming.videos.find((item) => item.slug === video.slug),
  })),
  { video: contrastVideo, timing: contrastTiming },
].filter(({ video }) => requestedSlugs.size === 0 || requestedSlugs.has(video.slug));

if (requestedSlugs.size && reviewVideos.length !== requestedSlugs.size) {
  const found = new Set(reviewVideos.map(({ video }) => video.slug));
  const missing = [...requestedSlugs].filter((slug) => !found.has(slug));
  throw new Error(`Unknown review slug(s): ${missing.join(", ")}`);
}

await mkdir(outputRoot, { recursive: true });
console.log(`Bundling the v2 review renderer for ${reviewVideos.length} video(s).`);
const serveUrl = await bundle({
  entryPoint: path.join(projectRoot, "production/video/src/index.ts"),
  webpackOverride: (config) => config,
});

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const createContactSheet = async ({ video, frames, outputPath }) => {
  const columns = frames.length > 6 ? 4 : 3;
  const cellWidth = 448;
  const imageHeight = 252;
  const labelHeight = 46;
  const gap = 22;
  const margin = 32;
  const headerHeight = 92;
  const rows = Math.ceil(frames.length / columns);
  const width = margin * 2 + columns * cellWidth + (columns - 1) * gap;
  const height = headerHeight + margin + rows * (imageHeight + labelHeight) + (rows - 1) * gap;
  const composites = [];

  composites.push({
    input: Buffer.from(
      `<svg width="${width}" height="${headerHeight}"><rect width="100%" height="100%" fill="#10221d"/><text x="${margin}" y="55" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#ffffff">${escapeXml(video.title)}</text><text x="${width - margin}" y="54" text-anchor="end" font-family="Arial, sans-serif" font-size="18" fill="#79e6bf">V2 REVIEW · ${frames.length} SCENES</text></svg>`,
    ),
    top: 0,
    left: 0,
  });

  for (const [index, frame] of frames.entries()) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const left = margin + column * (cellWidth + gap);
    const top = headerHeight + margin + row * (imageHeight + labelHeight + gap);
    const image = await sharp(frame.path)
      .resize(cellWidth, imageHeight, { fit: "cover" })
      .png()
      .toBuffer();
    composites.push({ input: image, left, top });
    composites.push({
      input: Buffer.from(
        `<svg width="${cellWidth}" height="${labelHeight}"><rect width="100%" height="100%" fill="#ffffff"/><text x="12" y="30" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="#10221d">${String(index + 1).padStart(2, "0")} · ${escapeXml(frame.sceneId)}</text></svg>`,
      ),
      left,
      top: top + imageHeight,
    });
  }

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#e9ede4",
    },
  })
    .composite(composites)
    .png()
    .toFile(outputPath);
};

for (const [videoIndex, { video, timing }] of reviewVideos.entries()) {
  if (!timing) throw new Error(`Missing timing for ${video.slug}`);
  const directory = path.join(outputRoot, video.slug);
  await mkdir(directory, { recursive: true });
  const composition = await selectComposition({
    serveUrl,
    id: video.compositionId,
  });
  const frames = [];

  for (const [sceneIndex, sceneTiming] of timing.scenes.entries()) {
    const scene = video.scenes[sceneIndex];
    const reviewFrame = Math.min(
      sceneTiming.startFrame + 52,
      sceneTiming.startFrame + sceneTiming.durationInFrames - 2,
    );
    const outputPath = path.join(
      directory,
      `${String(sceneIndex + 1).padStart(2, "0")}-${scene.id}.png`,
    );
    await renderStill({
      composition,
      serveUrl,
      output: outputPath,
      frame: reviewFrame,
      imageFormat: "png",
      overwrite: true,
    });
    frames.push({ path: outputPath, sceneId: scene.id });
  }

  const contactSheetPath = path.join(outputRoot, `${video.slug}-contact-sheet.png`);
  await createContactSheet({ video, frames, outputPath: contactSheetPath });
  console.log(
    `[${videoIndex + 1}/${reviewVideos.length}] ${video.slug}: ${frames.length} frames + contact sheet`,
  );
}
