import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const projectRoot = process.cwd();
const contentPath = path.resolve(projectRoot, process.argv[2] ?? "production/video/content/understanding-contrasts.json");
const content = JSON.parse(await readFile(contentPath, "utf8"));
const audioDirectory = path.join(projectRoot, "public", "video-production", content.slug, "audio");
const generatedDirectory = path.join(projectRoot, "production", "video", "generated");
const outputDirectory = path.join(projectRoot, "production", "video", "output");

await Promise.all([
  mkdir(audioDirectory, { recursive: true }),
  mkdir(generatedDirectory, { recursive: true }),
  mkdir(outputDirectory, { recursive: true }),
]);

const parseDuration = (afinfoOutput) => {
  const match = afinfoOutput.match(/estimated duration:\s*([\d.]+)\s*sec/i);
  if (!match) throw new Error(`Unable to read audio duration from afinfo output:\n${afinfoOutput}`);
  return Number(match[1]);
};

const formatTimestamp = (seconds) => {
  const milliseconds = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  const secs = Math.floor((milliseconds % 60_000) / 1000);
  const millis = milliseconds % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
};

const splitSentences = (text) => text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [text];

let timelineSeconds = 0;
let timelineFrames = 0;
let cueIndex = 1;
const sceneTiming = [];
const cues = [];
const srtBlocks = [];

for (const scene of content.scenes) {
  const aiffPath = path.join(audioDirectory, `${scene.id}.aiff`);
  const m4aPath = path.join(audioDirectory, `${scene.id}.m4a`);

  await rm(m4aPath, { force: true });
  await run("say", ["-v", content.voice, "-r", String(content.speechRate), "-o", aiffPath, scene.narration]);
  await run("afconvert", [aiffPath, m4aPath, "-f", "m4af", "-d", "aac "]);
  const { stdout } = await run("afinfo", [m4aPath]);
  const audioSeconds = parseDuration(stdout);
  const padSeconds = 0.85;
  const durationSeconds = audioSeconds + padSeconds;
  const durationInFrames = Math.ceil(durationSeconds * content.fps);
  const sentences = splitSentences(scene.narration);
  const totalWords = sentences.reduce((sum, sentence) => sum + sentence.split(/\s+/).length, 0);
  let sentenceOffset = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).length;
    const sentenceDuration = audioSeconds * (sentenceWords / totalWords);
    const startSeconds = timelineSeconds + sentenceOffset;
    const endSeconds = startSeconds + sentenceDuration;
    const cue = {
      index: cueIndex,
      text: sentence,
      startSeconds,
      endSeconds,
      startFrame: Math.floor(startSeconds * content.fps),
      endFrame: Math.ceil(endSeconds * content.fps),
    };
    cues.push(cue);
    srtBlocks.push(`${cueIndex}\n${formatTimestamp(startSeconds)} --> ${formatTimestamp(endSeconds)}\n${sentence}`);
    cueIndex += 1;
    sentenceOffset += sentenceDuration;
  }

  sceneTiming.push({
    id: scene.id,
    audioPath: `video-production/${content.slug}/audio/${scene.id}.m4a`,
    audioSeconds,
    durationSeconds,
    durationInFrames,
    startSeconds: timelineSeconds,
    startFrame: timelineFrames,
  });

  timelineSeconds += durationSeconds;
  timelineFrames += durationInFrames;
  await rm(aiffPath, { force: true });
}

const manifest = {
  fps: content.fps,
  totalFrames: timelineFrames,
  totalSeconds: timelineSeconds,
  voice: content.voice,
  speechRate: content.speechRate,
  scenes: sceneTiming,
  cues,
};

await writeFile(path.join(generatedDirectory, `${content.slug}.json`), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(path.join(outputDirectory, `${content.slug}.srt`), `${srtBlocks.join("\n\n")}\n`);
await writeFile(
  path.join(outputDirectory, `${content.slug}-transcript.md`),
  `# ${content.title}\n\n${content.scenes.map((scene) => `## ${scene.title}\n\n${scene.narration}`).join("\n\n")}\n\n---\n\nSource: ${content.source.repository} (${content.source.files.join(", ")}); ${content.source.license} License.\n`,
);

console.log(`Generated ${sceneTiming.length} narration clips (${timelineSeconds.toFixed(1)} seconds).`);
