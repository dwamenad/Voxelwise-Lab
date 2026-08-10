import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const projectRoot = process.cwd();
const outputDirectory = path.join(
  projectRoot,
  "public",
  "video-production",
  "voice-auditions",
  "audio",
);

const voices = [
  { name: "Samantha", slug: "samantha", accent: "US English" },
  { name: "Daniel", slug: "daniel", accent: "UK English" },
  { name: "Tessa", slug: "tessa", accent: "South African English" },
  { name: "Karen", slug: "karen", accent: "Australian English" },
];

const cadences = [
  { name: "Deliberate", slug: "deliberate", rate: 148 },
  { name: "Balanced", slug: "balanced", rate: 164 },
  { name: "Energetic", slug: "energetic", rate: 178 },
];

const passage =
  "At each voxel, FEAT fits the general linear model. A contrast does not refit the data; it converts a scientific question into a weighted combination of parameter estimates. For example, if the explanatory variables are Left followed by Right, one, negative one tests whether the Left response is greater than the Right response. Always verify the E V order before interpreting the result.";

const parseDuration = (afinfoOutput) => {
  const match = afinfoOutput.match(/estimated duration:\s*([\d.]+)\s*sec/i);
  if (!match) throw new Error(`Unable to read audio duration:\n${afinfoOutput}`);
  return Number(match[1]);
};

const quoteForConcat = (filePath) => `'${filePath.replaceAll("'", "'\\''")}'`;

await mkdir(outputDirectory, { recursive: true });

const samples = [];

for (const voice of voices) {
  for (const cadence of cadences) {
    const basename = `${voice.slug}-${cadence.slug}-${cadence.rate}wpm`;
    const aiffPath = path.join(outputDirectory, `${basename}.aiff`);
    const m4aPath = path.join(outputDirectory, `${basename}.m4a`);
    const spokenText = `${voice.name}. ${cadence.name} cadence, ${cadence.rate} words per minute. [[slnc 500]] ${passage} [[slnc 800]]`;

    await Promise.all([rm(aiffPath, { force: true }), rm(m4aPath, { force: true })]);
    await run("say", ["-v", voice.name, "-r", String(cadence.rate), "-o", aiffPath, spokenText]);
    await run("afconvert", [aiffPath, m4aPath, "-f", "m4af", "-d", "aac "]);
    const { stdout } = await run("afinfo", [m4aPath]);

    samples.push({
      voice: voice.name,
      accent: voice.accent,
      cadence: cadence.name,
      rate: cadence.rate,
      durationSeconds: parseDuration(stdout),
      file: m4aPath,
    });

    await rm(aiffPath, { force: true });
  }
}

const concatPath = path.join(outputDirectory, "voice-audition-concat.txt");
const reelPath = path.join(outputDirectory, "voxelwise-lab-voice-audition-reel.m4a");
await writeFile(
  concatPath,
  `${samples.map((sample) => `file ${quoteForConcat(sample.file)}`).join("\n")}\n`,
);

const ffmpegDirectory = path.join(
  projectRoot,
  "node_modules",
  "@remotion",
  "compositor-darwin-arm64",
);
await run(
  path.join(ffmpegDirectory, "ffmpeg"),
  [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatPath,
    "-c",
    "copy",
    "-f",
    "mp4",
    reelPath,
  ],
  { cwd: ffmpegDirectory },
);
await rm(concatPath, { force: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  passage,
  voices,
  cadences,
  samples: samples.map((sample) => ({
    ...sample,
    file: path.relative(projectRoot, sample.file),
  })),
  reel: path.relative(projectRoot, reelPath),
};

await writeFile(
  path.join(outputDirectory, "voice-auditions.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Generated ${samples.length} samples and one audition reel in ${outputDirectory}.`);
