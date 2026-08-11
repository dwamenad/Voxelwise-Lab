import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getLiveWalkthrough, liveWalkthroughs } from "../content/live-walkthroughs.mjs";

const projectRoot = process.cwd();
const generatedRoot = path.join(
  projectRoot,
  "production",
  "video",
  "generated",
  "walkthroughs",
);

const readJson = async (filePath) => JSON.parse(await readFile(filePath, "utf8"));

const opening = await readJson(path.join(generatedRoot, "opening-feat.json"));
const batch = await readJson(path.join(generatedRoot, "batch.json"));
const generated = [opening, ...(batch.walkthroughs ?? [])];
const flags = new Set(process.argv.slice(2).filter((value) => value.startsWith("--")));
const requestedSlugs = process.argv.slice(2).filter((value) => !value.startsWith("--"));
const renderReview = !flags.has("--raw-only");
const renderRaw = !flags.has("--review-only");
const selectedSlugs = requestedSlugs.length
  ? requestedSlugs
  : generated.map((item) => item.slug);

if (flags.has("--review-only") && flags.has("--raw-only")) {
  throw new Error("Choose either --review-only or --raw-only, not both.");
}

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: projectRoot, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code ?? signal}`));
    });
  });

const remotion = path.join(projectRoot, "node_modules", ".bin", "remotion");
const entryPoint = "production/video/src/index.ts";

for (const slug of selectedSlugs) {
  const definition = getLiveWalkthrough(slug);
  if (!definition) {
    throw new Error(
      `Unknown walkthrough "${slug}". Expected one of: ${liveWalkthroughs.map((item) => item.slug).join(", ")}`,
    );
  }
  const timing = generated.find((item) => item.slug === slug);
  if (!timing) {
    throw new Error(
      `${slug} has not been prepared. Run npm run video:prepare:walkthrough -- ${slug} /absolute/capture/path first.`,
    );
  }
  const outputRoot = path.join(
    "production",
    "video",
    "output",
    "walkthroughs",
    slug,
  );
  const commonArgs = ["--codec=h264", "--crf=18", "--concurrency=4", "--overwrite"];

  if (renderReview) {
    await run(remotion, [
      "render",
      entryPoint,
      timing.compositionId,
      path.join(outputRoot, `${slug}-review.mp4`),
      ...commonArgs,
    ]);
  }
  if (renderRaw) {
    await run(remotion, [
      "render",
      entryPoint,
      timing.rawCompositionId ?? definition.rawCompositionId,
      path.join(outputRoot, `${slug}-raw.mp4`),
      ...commonArgs,
    ]);
  }
}
