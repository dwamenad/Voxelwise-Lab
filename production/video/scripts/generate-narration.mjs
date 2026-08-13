import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildMultivoiceNarration } from "./build-multivoice-narration.mjs";

const projectRoot = process.cwd();
const contentPath = path.resolve(
  projectRoot,
  process.argv[2] ?? "production/video/content/understanding-contrasts.json",
);
const content = JSON.parse(await readFile(contentPath, "utf8"));
const generatedDirectory = path.join(projectRoot, "production", "video", "generated");
await mkdir(generatedDirectory, { recursive: true });

const manifest = await buildMultivoiceNarration({
  video: content,
  publicAudioRoot: path.join(projectRoot, "public", "video-production", content.slug, "audio-v3"),
  publicAudioBase: `video-production/${content.slug}/audio-v3`,
  outputDirectory: path.join(projectRoot, "production", "video", "output", "v3", content.slug),
});

await writeFile(
  path.join(generatedDirectory, `${content.slug}.json`),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Generated ${content.slug}: ${manifest.totalSeconds.toFixed(1)} seconds × ${manifest.voiceTracks.length} voices.`);
