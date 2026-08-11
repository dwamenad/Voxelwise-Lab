import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const dbfs = (value) => 20 * Math.log10(Math.max(value, 1e-12));

export const parseWave = (buffer) => {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("Decoded audio is not a RIFF/WAVE file.");
  }
  let offset = 12;
  let format;
  let data;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (id === "fmt ") {
      const encoding = buffer.readUInt16LE(start);
      format = {
        encoding,
        subformatEncoding: encoding === 0xfffe && size >= 40
          ? buffer.readUInt16LE(start + 24)
          : null,
        channels: buffer.readUInt16LE(start + 2),
        sampleRate: buffer.readUInt32LE(start + 4),
        bitsPerSample: buffer.readUInt16LE(start + 14),
      };
    }
    if (id === "data") data = { start, size: Math.min(size, buffer.length - start) };
    offset = start + size + (size % 2);
  }
  if (!format || !data) throw new Error("Decoded WAVE file is missing fmt or data chunks.");
  const integerPcm = format.encoding === 1 ||
    (format.encoding === 0xfffe && format.subformatEncoding === 1);
  if (!integerPcm || format.bitsPerSample !== 16) {
    throw new Error("Decoded WAVE file must contain 16-bit integer PCM.");
  }
  return { ...format, ...data };
};

export const analyzePcm = (buffer, wave) => {
  const sampleCount = Math.floor(wave.size / 2);
  const frameCount = Math.floor(sampleCount / wave.channels);
  const windowFrames = Math.round(wave.sampleRate * 0.1);
  const windowCount = Math.floor(frameCount / windowFrames);
  const windowSquares = new Float64Array(windowCount);
  let peak = 0;
  let sum = 0;
  let sumSquares = 0;
  let leftSum = 0;
  let rightSum = 0;
  let leftSquares = 0;
  let rightSquares = 0;
  let cross = 0;
  let maxStereoDifference = 0;

  for (let frame = 0; frame < frameCount; frame += 1) {
    let mono = 0;
    for (let channel = 0; channel < wave.channels; channel += 1) {
      const sampleIndex = frame * wave.channels + channel;
      const value = buffer.readInt16LE(wave.start + sampleIndex * 2) / 32768;
      peak = Math.max(peak, Math.abs(value));
      sumSquares += value * value;
      mono += value;
      if (wave.channels === 2) {
        if (channel === 0) {
          leftSum += value;
          leftSquares += value * value;
        } else {
          rightSum += value;
          rightSquares += value * value;
          const left = buffer.readInt16LE(wave.start + (sampleIndex - 1) * 2) / 32768;
          cross += left * value;
          maxStereoDifference = Math.max(maxStereoDifference, Math.abs(left - value));
        }
      }
    }
    mono /= wave.channels;
    sum += mono;
    const window = Math.floor(frame / windowFrames);
    if (window < windowCount) windowSquares[window] += mono * mono;
  }

  const windowDb = [...windowSquares].map((square) => dbfs(Math.sqrt(square / windowFrames)));
  const silent = windowDb.map((value) => value < -50);
  const runs = [];
  let runStart = null;
  for (let index = 0; index < silent.length; index += 1) {
    if (silent[index] && runStart === null) runStart = index;
    if (!silent[index] && runStart !== null) {
      runs.push([runStart, index]);
      runStart = null;
    }
  }
  if (runStart !== null) runs.push([runStart, silent.length]);
  const secondsPerWindow = windowFrames / wave.sampleRate;
  const longestSilenceSeconds = Math.max(0, ...runs.map(([start, end]) => end - start)) * secondsPerWindow;
  const leadingSilenceSeconds = runs[0]?.[0] === 0
    ? (runs[0][1] - runs[0][0]) * secondsPerWindow
    : 0;
  const trailing = runs.at(-1);
  const trailingSilenceSeconds = trailing?.[1] === silent.length
    ? (trailing[1] - trailing[0]) * secondsPerWindow
    : 0;
  const activeSeconds = silent.filter((value) => !value).length * secondsPerWindow;

  let stereoCorrelation = null;
  if (wave.channels === 2) {
    const leftMean = leftSum / frameCount;
    const rightMean = rightSum / frameCount;
    const covariance = cross / frameCount - leftMean * rightMean;
    const leftVariance = leftSquares / frameCount - leftMean * leftMean;
    const rightVariance = rightSquares / frameCount - rightMean * rightMean;
    stereoCorrelation = covariance / Math.sqrt(leftVariance * rightVariance);
  }

  return {
    durationSeconds: frameCount / wave.sampleRate,
    samplePeakDbfs: dbfs(peak),
    programRmsDbfs: dbfs(Math.sqrt(sumSquares / sampleCount)),
    crestFactorDb: dbfs(peak) - dbfs(Math.sqrt(sumSquares / sampleCount)),
    dcOffset: sum / frameCount,
    silencePercent: 100 * silent.filter(Boolean).length / Math.max(1, silent.length),
    activeSeconds,
    leadingSilenceSeconds,
    trailingSilenceSeconds,
    longestSilenceSeconds,
    stereoCorrelation,
    maxStereoDifference,
  };
};

const timestampSeconds = (value) => {
  const [hours, minutes, rest] = value.split(":");
  const [seconds, milliseconds] = rest.split(",");
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds) / 1000;
};

const analyzeCaptions = async (srtPath, durationSeconds) => {
  if (!srtPath) return null;
  const blocks = (await readFile(srtPath, "utf8")).trim().split(/\n{2,}/);
  const cues = blocks.map((block) => {
    const lines = block.split("\n");
    const [start, end] = lines[1].split(" --> ");
    return { start: timestampSeconds(start), end: timestampSeconds(end), text: lines.slice(2).join("\n") };
  });
  return {
    cueCount: cues.length,
    captionSeconds: cues.reduce((total, cue) => total + cue.end - cue.start, 0),
    lastCueEndSeconds: cues.at(-1)?.end ?? 0,
    postCaptionTailSeconds: durationSeconds - (cues.at(-1)?.end ?? 0),
    maxLines: Math.max(0, ...cues.map((cue) => cue.text.split("\n").length)),
    maxCharactersPerLine: Math.max(
      0,
      ...cues.flatMap((cue) => cue.text.split("\n").map((line) => line.length)),
    ),
  };
};

const analyzeNarration = async (narrationPath, durationSeconds, activeSeconds) => {
  if (!narrationPath) return null;
  const markdown = await readFile(narrationPath, "utf8");
  const spoken = markdown
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .join(" ");
  const words = spoken.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g) ?? [];
  return {
    words: words.length,
    overallWordsPerMinute: words.length / (durationSeconds / 60),
    activeWordsPerMinute: words.length / (activeSeconds / 60),
  };
};

export async function validateVideoAudio({ mediaPath, srtPath, narrationPath }) {
  const resolvedMediaPath = path.resolve(mediaPath);
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "voxelwise-audio-qc-"));
  const wavePath = path.join(temporaryRoot, "decoded.wav");
  try {
    await run("afconvert", [resolvedMediaPath, wavePath, "-f", "WAVE", "-d", "LEI16"]);
    const buffer = await readFile(wavePath);
    const wave = parseWave(buffer);
    const signal = analyzePcm(buffer, wave);
    const { stdout, stderr } = await run("afclip", ["-x", wavePath], {
      maxBuffer: 5 * 1024 * 1024,
    });
    const clipOutput = `${stdout}\n${stderr}`;
    const captions = await analyzeCaptions(srtPath && path.resolve(srtPath), signal.durationSeconds);
    const narration = await analyzeNarration(
      narrationPath && path.resolve(narrationPath),
      signal.durationSeconds,
      signal.activeSeconds,
    );
    const metrics = {
      mediaPath: resolvedMediaPath,
      sampleRate: wave.sampleRate,
      channels: wave.channels,
      ...signal,
      intersampleClippingDetected: !clipOutput.includes("-- no samples clipped --"),
      captions,
      narration,
    };
    const errors = [];
    if (wave.sampleRate !== 48000) errors.push(`Audio sample rate must be 48000 Hz; found ${wave.sampleRate}.`);
    if (wave.channels !== 2) errors.push(`Audio must be stereo; found ${wave.channels} channel(s).`);
    if (metrics.intersampleClippingDetected) errors.push("Apple afclip detected sample or inter-sample clipping.");
    if (signal.samplePeakDbfs > -1) errors.push(`Sample peak ${signal.samplePeakDbfs.toFixed(2)} dBFS leaves insufficient headroom.`);
    if (signal.programRmsDbfs < -28 || signal.programRmsDbfs > -16) {
      errors.push(`Program RMS ${signal.programRmsDbfs.toFixed(2)} dBFS falls outside -28 to -16 dBFS.`);
    }
    if (Math.abs(signal.dcOffset) > 0.01) errors.push(`DC offset ${signal.dcOffset.toFixed(5)} is too large.`);
    if (signal.leadingSilenceSeconds > 1.5) errors.push("Leading silence exceeds 1.5 seconds.");
    if (signal.trailingSilenceSeconds > 2) errors.push("Trailing silence exceeds 2 seconds.");
    if (signal.longestSilenceSeconds > 2.5) errors.push("An internal silence exceeds 2.5 seconds.");
    if (captions?.postCaptionTailSeconds < 0 || captions?.postCaptionTailSeconds > 2) {
      errors.push(`Caption tail must be between 0 and 2 seconds; found ${captions.postCaptionTailSeconds.toFixed(2)}.`);
    }
    if (captions?.maxLines > 2 || captions?.maxCharactersPerLine > 42) {
      errors.push("Captions exceed the two-line or 42-character production limit.");
    }
    if (narration && (narration.overallWordsPerMinute < 100 || narration.overallWordsPerMinute > 160)) {
      errors.push(`Overall narration pace ${narration.overallWordsPerMinute.toFixed(1)} WPM falls outside 100–160 WPM.`);
    }
    return { metrics, errors };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

const isDirectRun = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isDirectRun) {
  const [mediaPath, srtPath, narrationPath] = process.argv.slice(2);
  if (!mediaPath) {
    throw new Error("Usage: node validate-video-audio.mjs <media> [captions.srt] [narration.md]");
  }
  const result = await validateVideoAudio({ mediaPath, srtPath, narrationPath });
  console.log(JSON.stringify(result.metrics, null, 2));
  if (result.errors.length) {
    console.error(`Audio validation failed with ${result.errors.length} issue(s):`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log("Audio signal, silence, pace, and caption-tail checks passed.");
}
