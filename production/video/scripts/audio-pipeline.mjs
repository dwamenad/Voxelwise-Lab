import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { parseDuration, toTtsText } from "./narration-utils.mjs";

const run = promisify(execFile);
const projectRoot = process.cwd();
const ffmpegDirectory = path.join(
  projectRoot,
  "node_modules",
  "@remotion",
  "compositor-darwin-arm64",
);
const ffmpegPath = path.join(ffmpegDirectory, "ffmpeg");

const dbfs = (value) => (value > 0 ? 20 * Math.log10(value) : -120);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const findChunk = (buffer, id) => {
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (chunkId === id) return { offset: offset + 8, size };
    offset += 8 + size + (size % 2);
  }
  throw new Error(`WAV chunk ${id} was not found.`);
};

const readPcm16Wav = async (filePath) => {
  const buffer = await readFile(filePath);
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error(`${filePath} is not a RIFF/WAVE file.`);
  }
  const format = findChunk(buffer, "fmt ");
  const audioFormat = buffer.readUInt16LE(format.offset);
  const channels = buffer.readUInt16LE(format.offset + 2);
  const sampleRate = buffer.readUInt32LE(format.offset + 4);
  const bitsPerSample = buffer.readUInt16LE(format.offset + 14);
  if (audioFormat !== 1 || channels !== 1 || bitsPerSample !== 16) {
    throw new Error(`Expected mono PCM16 WAV, received format=${audioFormat}, channels=${channels}, bits=${bitsPerSample}.`);
  }
  const data = findChunk(buffer, "data");
  const sampleCount = Math.floor(data.size / 2);
  const samples = new Float64Array(sampleCount);
  for (let index = 0; index < sampleCount; index += 1) {
    samples[index] = buffer.readInt16LE(data.offset + index * 2) / 32768;
  }
  return { samples, sampleRate };
};

const writePcm16Wav = async (filePath, samples, sampleRate) => {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.round(clamp(samples[index], -1, 1 - 1 / 32768) * 32768);
    buffer.writeInt16LE(sample, 44 + index * 2);
  }
  await writeFile(filePath, buffer);
};

const windowRms = (samples, windowSize) => {
  const values = [];
  for (let start = 0; start < samples.length; start += windowSize) {
    const end = Math.min(samples.length, start + windowSize);
    let sum = 0;
    for (let index = start; index < end; index += 1) sum += samples[index] ** 2;
    values.push(Math.sqrt(sum / Math.max(1, end - start)));
  }
  return values;
};

const cleanPcm = (input, sampleRate, targets) => {
  const samples = Float64Array.from(input);
  const mean = samples.reduce((sum, sample) => sum + sample, 0) / Math.max(1, samples.length);
  for (let index = 0; index < samples.length; index += 1) samples[index] -= mean;

  const rc = 1 / (2 * Math.PI * targets.highPassHz);
  const dt = 1 / sampleRate;
  const alpha = rc / (rc + dt);
  let priorInput = samples[0] ?? 0;
  let priorOutput = 0;
  for (let index = 1; index < samples.length; index += 1) {
    const current = samples[index];
    const filtered = alpha * (priorOutput + current - priorInput);
    samples[index] = filtered;
    priorInput = current;
    priorOutput = filtered;
  }

  const analysisWindow = Math.max(1, Math.round(sampleRate * 0.01));
  const rmsWindows = windowRms(samples, analysisWindow);
  const threshold = 10 ** (targets.silenceThresholdDb / 20);
  const firstActiveWindow = rmsWindows.findIndex((value) => value >= threshold);
  let lastActiveWindow = -1;
  for (let index = rmsWindows.length - 1; index >= 0; index -= 1) {
    if (rmsWindows[index] >= threshold) {
      lastActiveWindow = index;
      break;
    }
  }
  const preRoll = Math.round(sampleRate * 0.08);
  const postRoll = Math.round(sampleRate * 0.12);
  const startSample = firstActiveWindow < 0 ? 0 : Math.max(0, firstActiveWindow * analysisWindow - preRoll);
  const endSample = lastActiveWindow < 0
    ? samples.length
    : Math.min(samples.length, (lastActiveWindow + 1) * analysisWindow + postRoll);
  const trimmed = samples.slice(startSample, Math.max(startSample + 1, endSample));

  const fadeSamples = Math.min(Math.round(sampleRate * 0.012), Math.floor(trimmed.length / 2));
  for (let index = 0; index < fadeSamples; index += 1) {
    const gain = index / Math.max(1, fadeSamples);
    trimmed[index] *= gain;
    trimmed[trimmed.length - 1 - index] *= gain;
  }

  const trimmedWindows = windowRms(trimmed, analysisWindow).sort((a, b) => a - b);
  const noiseFloor = trimmedWindows[Math.floor(trimmedWindows.length * 0.1)] ?? 0;
  let peak = 0;
  let sumSquares = 0;
  let clippedSamples = 0;
  for (const sample of trimmed) {
    peak = Math.max(peak, Math.abs(sample));
    sumSquares += sample ** 2;
    if (Math.abs(sample) >= 0.999) clippedSamples += 1;
  }

  return {
    samples: trimmed,
    metrics: {
      dcOffsetRemoved: mean,
      sourcePeakDbfs: dbfs(peak),
      sourceRmsDbfs: dbfs(Math.sqrt(sumSquares / Math.max(1, trimmed.length))),
      sourceNoiseFloorDbfs: dbfs(noiseFloor),
      clippedSamples,
      trimmedStartSeconds: startSample / sampleRate,
      trimmedEndSeconds: (samples.length - endSample) / sampleRate,
      cleanedDurationSeconds: trimmed.length / sampleRate,
    },
  };
};

const parseLoudnorm = (stderr) => {
  const matches = [...stderr.matchAll(/\{[\s\S]*?"input_i"[\s\S]*?\}/g)];
  if (!matches.length) throw new Error(`Unable to parse loudnorm output:\n${stderr}`);
  const parsed = JSON.parse(matches[matches.length - 1][0]);
  return {
    integratedLufs: Number(parsed.input_i),
    truePeakDb: Number(parsed.input_tp),
    loudnessRange: Number(parsed.input_lra),
    thresholdLufs: Number(parsed.input_thresh),
  };
};

export const loadVoiceRegistry = async () =>
  JSON.parse(
    await readFile(path.join(projectRoot, "production", "video", "config", "voices.json"), "utf8"),
  );

export const verifyInstalledVoices = async (registry) => {
  const { stdout } = await run("say", ["-v", "?"]);
  const installed = new Set(
    stdout
      .split("\n")
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean),
  );
  const missing = registry.voices.filter((voice) => !installed.has(voice.engineVoice));
  if (missing.length) {
    throw new Error(`Missing system voice(s): ${missing.map((voice) => voice.engineVoice).join(", ")}`);
  }
};

export const prepareNarrationClip = async ({ text, voice, basename, workingDirectory, targets }) => {
  await mkdir(workingDirectory, { recursive: true });
  const aiffPath = path.join(workingDirectory, `${basename}.source.aiff`);
  const sourceWavPath = path.join(workingDirectory, `${basename}.source.wav`);
  const cleanWavPath = path.join(workingDirectory, `${basename}.clean.wav`);
  await Promise.all([
    rm(aiffPath, { force: true }),
    rm(sourceWavPath, { force: true }),
    rm(cleanWavPath, { force: true }),
  ]);
  await run("say", [
    "-v",
    voice.engineVoice,
    "-r",
    String(voice.speechRate),
    "-o",
    aiffPath,
    toTtsText(text),
  ]);
  await run("afconvert", [aiffPath, sourceWavPath, "-f", "WAVE", "-d", `LEI16@${targets.sampleRate}`]);
  const { samples, sampleRate } = await readPcm16Wav(sourceWavPath);
  const cleaned = cleanPcm(samples, sampleRate, targets);
  await writePcm16Wav(cleanWavPath, cleaned.samples, sampleRate);
  await Promise.all([rm(aiffPath, { force: true }), rm(sourceWavPath, { force: true })]);
  return { cleanWavPath, ...cleaned.metrics };
};

export const encodeNarrationClip = async ({ cleanWavPath, outputPath, durationSeconds, targets }) => {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await rm(outputPath, { force: true });
  const filter = [
    "apad",
    `atrim=0:${durationSeconds.toFixed(6)}`,
    `loudnorm=I=${targets.integratedLufs}:TP=${targets.truePeakDb}:LRA=${targets.loudnessRange}`,
  ].join(",");
  await run(
    ffmpegPath,
    [
      "-y",
      "-i",
      cleanWavPath,
      "-af",
      filter,
      "-ar",
      String(targets.sampleRate),
      "-ac",
      "2",
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      "-f",
      "mp4",
      outputPath,
    ],
    { cwd: ffmpegDirectory, maxBuffer: 10 * 1024 * 1024 },
  );
  const analysis = await run(
    ffmpegPath,
    [
      "-i",
      outputPath,
      "-af",
      `loudnorm=I=${targets.integratedLufs}:TP=${targets.truePeakDb}:LRA=${targets.loudnessRange}:print_format=json`,
      "-f",
      "null",
      "-",
    ],
    { cwd: ffmpegDirectory, maxBuffer: 10 * 1024 * 1024 },
  );
  const { stdout } = await run("afinfo", [outputPath]);
  const encodedDurationSeconds = parseDuration(stdout);
  const loudness = parseLoudnorm(analysis.stderr);
  return {
    ...loudness,
    encodedDurationSeconds,
    clippingPassed: loudness.truePeakDb <= targets.truePeakDb + 0.25,
    loudnessPassed: Math.abs(loudness.integratedLufs - targets.integratedLufs) <= 1,
  };
};

export const removePreparedClip = ({ cleanWavPath }) => rm(cleanWavPath, { force: true });
