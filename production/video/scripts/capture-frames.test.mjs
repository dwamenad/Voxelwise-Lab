// @vitest-environment node
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { replaceCaptureFrames } from "./capture-frames.mjs";

let root;
beforeEach(async () => { root = await mkdtemp(path.join(os.tmpdir(), "voxelwise-capture-test-")); });
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

it("preserves the existing cache when any source scene is missing", async () => {
  const frameRoot = path.join(root, "frames");
  const captureRoot = path.join(root, "captures");
  await mkdir(frameRoot);
  await writeFile(path.join(frameRoot, "existing.png"), "old frame");
  await mkdir(path.join(captureRoot, "present"), { recursive: true });
  await writeFile(path.join(captureRoot, "present", "0001.png"), "new frame");
  await expect(replaceCaptureFrames({ captureRoot, frameRoot, sceneNames: ["present", "missing"], assetBase: "frames" })).rejects.toThrow();
  expect(await readFile(path.join(frameRoot, "existing.png"), "utf8")).toBe("old frame");
});

it("replaces the cache only after all frames are copied", async () => {
  const frameRoot = path.join(root, "frames");
  const captureRoot = path.join(root, "captures");
  await mkdir(frameRoot);
  await writeFile(path.join(frameRoot, "existing.png"), "old frame");
  await mkdir(path.join(captureRoot, "scene"), { recursive: true });
  await writeFile(path.join(captureRoot, "scene", "0001.png"), "new frame");
  const scenes = await replaceCaptureFrames({ captureRoot, frameRoot, sceneNames: ["scene"], assetBase: "frames" });
  expect(await readFile(path.join(frameRoot, "scene", "0001.png"), "utf8")).toBe("new frame");
  expect(scenes.get("scene").frameCount).toBe(1);
  await expect(readFile(path.join(frameRoot, "existing.png"))).rejects.toThrow();
});
