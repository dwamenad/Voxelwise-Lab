import { describe, expect, it } from "vitest";
import { analyzePcm, parseWave } from "./validate-video-audio.mjs";

const sineWave = ({ sampleRate = 48_000, seconds = 1, amplitude = 0.5 } = {}) => {
  const channels = 2;
  const frames = sampleRate * seconds;
  const dataSize = frames * channels * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * 2, 28);
  buffer.writeUInt16LE(channels * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let frame = 0; frame < frames; frame += 1) {
    const value = Math.round(Math.sin(2 * Math.PI * 440 * frame / sampleRate) * amplitude * 32767);
    buffer.writeInt16LE(value, 44 + frame * 4);
    buffer.writeInt16LE(value, 46 + frame * 4);
  }
  return buffer;
};

describe("walkthrough audio analysis", () => {
  it("parses stereo PCM and calculates stable signal metrics", () => {
    const buffer = sineWave();
    const wave = parseWave(buffer);
    const metrics = analyzePcm(buffer, wave);

    expect(wave.sampleRate).toBe(48_000);
    expect(wave.channels).toBe(2);
    expect(metrics.durationSeconds).toBeCloseTo(1, 5);
    expect(metrics.samplePeakDbfs).toBeCloseTo(-6.02, 1);
    expect(metrics.programRmsDbfs).toBeCloseTo(-9.03, 1);
    expect(metrics.stereoCorrelation).toBeCloseTo(1, 8);
    expect(metrics.maxStereoDifference).toBe(0);
  });
});
