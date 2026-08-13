import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildMultivoiceNarration } from "./build-multivoice-narration.mjs";

const projectRoot = process.cwd();
const contentPath = path.join(projectRoot, "production", "video", "content", "concept-library.json");
const generatedPath = path.join(projectRoot, "production", "video", "generated", "concept-library.json");
const outputRoot = path.join(projectRoot, "production", "video", "output", "concepts", "v3");
const library = JSON.parse(await readFile(contentPath, "utf8"));
const requestedSlugs = new Set(process.argv.slice(2));
const videos = library.videos.filter((video) => requestedSlugs.size === 0 || requestedSlugs.has(video.slug));

if (requestedSlugs.size && videos.length !== requestedSlugs.size) {
  const found = new Set(videos.map((video) => video.slug));
  throw new Error(`Unknown concept slug(s): ${[...requestedSlugs].filter((slug) => !found.has(slug)).join(", ")}`);
}

await mkdir(path.dirname(generatedPath), { recursive: true });
const generatedVideos = [];
for (const video of videos) {
  const timing = await buildMultivoiceNarration({
    video,
    publicAudioRoot: path.join(projectRoot, "public", "video-production", video.slug, "audio-v3"),
    publicAudioBase: `video-production/${video.slug}/audio-v3`,
    outputDirectory: path.join(outputRoot, video.slug),
  });
  generatedVideos.push(timing);
  console.log(`${video.slug}: ${timing.totalSeconds.toFixed(1)} seconds × ${timing.voiceTracks.length} voices`);
}

const existing = requestedSlugs.size
  ? JSON.parse(await readFile(generatedPath, "utf8").catch(() => '{"videos":[]}'))
  : { videos: [] };
const generatedBySlug = new Map(existing.videos.map((video) => [video.slug, video]));
for (const video of generatedVideos) generatedBySlug.set(video.slug, video);
await writeFile(
  generatedPath,
  `${JSON.stringify({ version: 3, videos: [...generatedBySlug.values()] }, null, 2)}\n`,
);

const totalSeconds = generatedVideos.reduce((sum, video) => sum + video.totalSeconds, 0);
console.log(`Generated ${generatedVideos.length} synchronized video manifest(s), ${(totalSeconds / 60).toFixed(1)} minutes per voice.`);
