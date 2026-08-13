import { spawn } from "node:child_process";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const target = process.argv[2];
const targetConfig = {
  contrasts: {
    compositionId: "UnderstandingContrasts",
    outputRoot: path.join(projectRoot, "production", "video", "output", "understanding-contrasts-v3"),
  },
  "opening-feat": {
    compositionId: "OpeningFeatWalkthrough",
    outputRoot: path.join(projectRoot, "production", "video", "output", "walkthroughs", "opening-feat", "masters-v3"),
  },
}[target];

if (!targetConfig) throw new Error("Usage: node render-voice-variants.mjs <contrasts|opening-feat> [voice IDs...]");
const registry = JSON.parse(
  await readFile(path.join(projectRoot, "production", "video", "config", "voices.json"), "utf8"),
);
const requestedVoiceIds = process.argv.slice(3);
const voiceIds = requestedVoiceIds.length ? requestedVoiceIds : registry.voices.map((voice) => voice.id);
const knownVoiceIds = new Set(registry.voices.map((voice) => voice.id));
const unknown = voiceIds.filter((voiceId) => !knownVoiceIds.has(voiceId));
if (unknown.length) throw new Error(`Unknown voice ID(s): ${unknown.join(", ")}`);

const suffix = (voiceId) => `${voiceId[0]?.toUpperCase() ?? ""}${voiceId.slice(1)}`;
const render = (voiceId, outputPath) => new Promise((resolve, reject) => {
  const compositionId = voiceId === registry.defaultVoiceId
    ? targetConfig.compositionId
    : `${targetConfig.compositionId}${suffix(voiceId)}`;
  const child = spawn(
    path.join(projectRoot, "node_modules", ".bin", "remotion"),
    [
      "render",
      "production/video/src/index.ts",
      compositionId,
      outputPath,
      "--codec=h264",
      "--crf=18",
      "--concurrency=4",
      "--overwrite",
      "--quiet",
      "--log=error",
    ],
    { cwd: projectRoot, stdio: "inherit" },
  );
  child.on("error", reject);
  child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Remotion exited with code ${code} for ${target}/${voiceId}`)));
});

await mkdir(targetConfig.outputRoot, { recursive: true });
for (const [index, voiceId] of voiceIds.entries()) {
  const outputPath = path.join(targetConfig.outputRoot, `${voiceId}.mp4`);
  console.log(`[${index + 1}/${voiceIds.length}] Rendering ${target}/${voiceId}`);
  await render(voiceId, outputPath);
  const file = await stat(outputPath);
  console.log(`Completed ${voiceId}: ${(file.size / 1_000_000).toFixed(1)} MB`);
}
