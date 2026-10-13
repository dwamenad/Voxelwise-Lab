import { copyFile, mkdir, mkdtemp, readdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";

export async function replaceCaptureFrames({ captureRoot, frameRoot, sceneNames, assetBase }) {
  // Check all sources before touching the working cache.
  const sources = await Promise.all(sceneNames.map(async (sceneName) => {
    const sourceDirectory = path.join(captureRoot, sceneName);
    const files = (await readdir(sourceDirectory)).filter((file) => file.endsWith(".png")).sort();
    if (!files.length) throw new Error(`No PNG frames found in ${sourceDirectory}`);
    await Promise.all(files.map(async (file) => {
      if (!(await stat(path.join(sourceDirectory, file))).isFile()) throw new Error(`Not a frame file: ${file}`);
    }));
    return { sceneName, sourceDirectory, files };
  }));

  await mkdir(path.dirname(frameRoot), { recursive: true });
  const stagingRoot = await mkdtemp(`${frameRoot}.staging-`);
  const backupRoot = `${stagingRoot}.backup`;
  let hasBackup = false;
  try {
    for (const { sceneName, sourceDirectory, files } of sources) {
      const targetDirectory = path.join(stagingRoot, sceneName);
      await mkdir(targetDirectory);
      await Promise.all(files.map((file) => copyFile(path.join(sourceDirectory, file), path.join(targetDirectory, file))));
    }
    try {
      await rename(frameRoot, backupRoot);
      hasBackup = true;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    try {
      await rename(stagingRoot, frameRoot);
    } catch (error) {
      if (hasBackup) await rename(backupRoot, frameRoot);
      throw error;
    }
    if (hasBackup) await rm(backupRoot, { recursive: true, force: true });
  } finally {
    await rm(stagingRoot, { recursive: true, force: true });
  }
  return new Map(sources.map(({ sceneName, files }) => [sceneName, {
    id: sceneName,
    assetRoot: `${assetBase}/${sceneName}`,
    frameCount: files.length,
  }]));
}
