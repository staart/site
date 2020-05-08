import { copy, remove } from "fs-extra";
import { join } from "path";

const setupDist = async () => {
  const files = ["src", "static", ".eleventy.ts"];
  for await (const file of files) {
    await copy(join(".", file), join(".", "dist", file));
  }
  await remove(join(".", "dist", "package.json"));
};

setupDist();
