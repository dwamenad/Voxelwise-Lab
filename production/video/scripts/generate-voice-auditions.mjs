import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  encodeNarrationClip,
  loadVoiceRegistry,
  prepareNarrationClip,
  removePreparedClip,
  verifyInstalledVoices,
} from "./audio-pipeline.mjs";

const run = promisify(execFile);
const projectRoot = process.cwd();
const outputDirectory = path.join(
  projectRoot,
  "public",
  "voice-previews",
);
const registry = await loadVoiceRegistry();

const passage =
  "At each voxel, FEAT fits the general linear model. A contrast does not refit the data; it converts a scientific question into a weighted combination of parameter estimates. Open the NIfTI image in FSLEyes, verify the explanatory-variable order, inspect the BOLD time series, and document the quality-control decision before interpreting the result.";

const quoteForConcat = (filePath) => `'${filePath.replaceAll("'", "'\\''")}'`;

await verifyInstalledVoices(registry);
await mkdir(outputDirectory, { recursive: true });

const samples = [];
for (const voice of registry.voices) {
  const basename = `${voice.id}-balanced-${voice.speechRate}wpm`;
  const outputPath = path.join(outputDirectory, `${basename}.m4a`);
  const prepared = await prepareNarrationClip({
    text: `${voice.displayName}. ${voice.accent}. ${passage}`,
    voice,
    basename,
    workingDirectory: outputDirectory,
    targets: registry.audioTargets,
  });
  const durationSeconds = prepared.cleanedDurationSeconds + 0.65;
  const encoded = await encodeNarrationClip({
    cleanWavPath: prepared.cleanWavPath,
    outputPath,
    durationSeconds,
    targets: registry.audioTargets,
  });
  await removePreparedClip(prepared);
  samples.push({
    voiceId: voice.id,
    voice: voice.displayName,
    accent: voice.accent,
    locale: voice.locale,
    cadence: "Balanced",
    rate: voice.speechRate,
    durationSeconds: encoded.encodedDurationSeconds,
    file: path.relative(projectRoot, outputPath),
    qc: {
      sourcePeakDbfs: prepared.sourcePeakDbfs,
      sourceRmsDbfs: prepared.sourceRmsDbfs,
      sourceNoiseFloorDbfs: prepared.sourceNoiseFloorDbfs,
      dcOffsetRemoved: prepared.dcOffsetRemoved,
      clippedSamples: prepared.clippedSamples,
      integratedLufs: encoded.integratedLufs,
      truePeakDb: encoded.truePeakDb,
      loudnessRange: encoded.loudnessRange,
      loudnessPassed: encoded.loudnessPassed,
      clippingPassed: encoded.clippingPassed,
    },
  });
  console.log(`${voice.displayName}: ${encoded.encodedDurationSeconds.toFixed(1)}s, ${encoded.integratedLufs.toFixed(1)} LUFS`);
}

const concatPath = path.join(outputDirectory, "voice-audition-concat.txt");
const reelPath = path.join(outputDirectory, "voxelwise-lab-voice-audition-reel.m4a");
await writeFile(
  concatPath,
  `${samples.map((sample) => `file ${quoteForConcat(path.join(projectRoot, sample.file))}`).join("\n")}\n`,
);

const ffmpegDirectory = path.join(projectRoot, "node_modules", "@remotion", "compositor-darwin-arm64");
await run(
  path.join(ffmpegDirectory, "ffmpeg"),
  ["-y", "-f", "concat", "-safe", "0", "-i", concatPath, "-c", "copy", "-f", "mp4", reelPath],
  { cwd: ffmpegDirectory },
);
await rm(concatPath, { force: true });

const manifest = {
  version: registry.version,
  generatedAt: new Date().toISOString(),
  defaultVoiceId: registry.defaultVoiceId,
  passage,
  terminologyChecklist: [
    "FEAT",
    "general linear model",
    "NIfTI",
    "FSLEyes",
    "explanatory variable",
    "BOLD",
    "quality control",
  ],
  audioTargets: registry.audioTargets,
  voices: registry.voices,
  samples,
  reel: path.relative(projectRoot, reelPath),
};

await writeFile(
  path.join(outputDirectory, "voice-auditions.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Generated ${samples.length} normalized voice previews and one audition reel.`);
