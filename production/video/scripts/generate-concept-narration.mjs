import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const projectRoot = process.cwd();
const contentPath = path.join(projectRoot, "production", "video", "content", "concept-library.json");
const generatedPath = path.join(projectRoot, "production", "video", "generated", "concept-library.json");
const outputRoot = path.join(projectRoot, "production", "video", "output", "concepts");
const library = JSON.parse(await readFile(contentPath, "utf8"));

const parseDuration = (afinfoOutput) => {
  const match = afinfoOutput.match(/estimated duration:\s*([\d.]+)\s*sec/i);
  if (!match) throw new Error(`Unable to read audio duration:\n${afinfoOutput}`);
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

const splitSentences = (text) =>
  text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [text];

const seenSlugs = new Set();
const seenCompositionIds = new Set();
const generatedVideos = [];

for (const video of library.videos) {
  if (seenSlugs.has(video.slug)) throw new Error(`Duplicate video slug: ${video.slug}`);
  if (seenCompositionIds.has(video.compositionId)) throw new Error(`Duplicate composition ID: ${video.compositionId}`);
  seenSlugs.add(video.slug);
  seenCompositionIds.add(video.compositionId);

  const audioDirectory = path.join(projectRoot, "public", "video-production", video.slug, "audio");
  const outputDirectory = path.join(outputRoot, video.slug);
  await Promise.all([
    mkdir(audioDirectory, { recursive: true }),
    mkdir(outputDirectory, { recursive: true }),
    mkdir(path.dirname(generatedPath), { recursive: true }),
  ]);

  let timelineSeconds = 0;
  let timelineFrames = 0;
  let cueIndex = 1;
  const sceneTiming = [];
  const cues = [];
  const srtBlocks = [];

  for (const scene of video.scenes) {
    const aiffPath = path.join(audioDirectory, `${scene.id}.aiff`);
    const m4aPath = path.join(audioDirectory, `${scene.id}.m4a`);
    await Promise.all([rm(aiffPath, { force: true }), rm(m4aPath, { force: true })]);
    await run("say", ["-v", video.voice, "-r", String(video.speechRate), "-o", aiffPath, scene.narration]);
    await run("afconvert", [aiffPath, m4aPath, "-f", "m4af", "-d", "aac "]);
    const { stdout } = await run("afinfo", [m4aPath]);
    const audioSeconds = parseDuration(stdout);
    const padSeconds = 0.85;
    const durationSeconds = audioSeconds + padSeconds;
    const durationInFrames = Math.ceil(durationSeconds * video.fps);
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
        startFrame: Math.floor(startSeconds * video.fps),
        endFrame: Math.ceil(endSeconds * video.fps),
      };
      cues.push(cue);
      srtBlocks.push(`${cueIndex}\n${formatTimestamp(startSeconds)} --> ${formatTimestamp(endSeconds)}\n${sentence}`);
      cueIndex += 1;
      sentenceOffset += sentenceDuration;
    }

    sceneTiming.push({
      id: scene.id,
      audioPath: `video-production/${video.slug}/audio/${scene.id}.m4a`,
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

  const transcript = [
    `# ${video.title}`,
    "",
    ...video.scenes.flatMap((scene) => [`## ${scene.display.title}`, "", scene.narration, ""]),
    "---",
    "",
    `Source: ${video.source.repository}, ${video.source.file}, ${video.source.section}; ${video.source.license} License.`,
    "",
  ].join("\n");

  await Promise.all([
    writeFile(path.join(outputDirectory, `${video.slug}.srt`), `${srtBlocks.join("\n\n")}\n`),
    writeFile(path.join(outputDirectory, `${video.slug}-transcript.md`), transcript),
  ]);

  generatedVideos.push({
    slug: video.slug,
    compositionId: video.compositionId,
    fps: video.fps,
    totalFrames: timelineFrames,
    totalSeconds: timelineSeconds,
    voice: video.voice,
    speechRate: video.speechRate,
    scenes: sceneTiming,
    cues,
  });

  console.log(`${video.slug}: ${timelineSeconds.toFixed(1)} seconds`);
}

await writeFile(
  generatedPath,
  `${JSON.stringify({ version: library.version, videos: generatedVideos }, null, 2)}\n`,
);

const totalSeconds = generatedVideos.reduce((sum, video) => sum + video.totalSeconds, 0);
console.log(`Generated ${generatedVideos.length} videos (${(totalSeconds / 60).toFixed(1)} total minutes).`);
