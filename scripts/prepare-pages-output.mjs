import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const openNextDir = path.join(rootDir, ".open-next");
const pagesOutDir = path.join(rootDir, "pages-dist");

const removeIfExists = async (target) => {
  await fs.rm(target, { recursive: true, force: true });
};

const copyDir = async (from, to) => {
  await fs.cp(from, to, { recursive: true, force: true });
};

const exists = async (target) => {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
};

const prepareWorkerFile = async () => {
  const workerPath = path.join(openNextDir, "worker.js");
  const workerContent = await fs.readFile(workerPath, "utf8");

  // Pages bundling may fail on unresolved DO helper modules from OpenNext output.
  const patchedWorker = workerContent
    .replace(
      /^.*DOQueueHandler.*$/m,
      ""
    )
    .replace(
      /^.*DOShardedTagCache.*$/m,
      ""
    )
    .replace(
      /^.*BucketCachePurge.*$/m,
      ""
    )
    .replaceAll("./.build/", "./build/");

  await fs.writeFile(path.join(pagesOutDir, "_worker.js"), patchedWorker, "utf8");
};

const main = async () => {
  if (!(await exists(openNextDir))) {
    throw new Error("Missing .open-next output. Run `npm run cf:build` first.");
  }

  await removeIfExists(pagesOutDir);
  await copyDir(openNextDir, pagesOutDir);

  const hiddenBuildDir = path.join(pagesOutDir, ".build");
  const normalBuildDir = path.join(pagesOutDir, "build");
  if (await exists(hiddenBuildDir)) {
    await removeIfExists(normalBuildDir);
    await fs.rename(hiddenBuildDir, normalBuildDir);
  }

  await prepareWorkerFile();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
