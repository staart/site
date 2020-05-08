import {
  copy,
  copyFile,
  ensureFile,
  lstat,
  mkdirp,
  pathExists,
  readdir,
  readFile,
  writeFile,
} from "fs-extra";
import { join } from "path";
import recursiveReaddir from "recursive-readdir";
import { replaceStart } from "../util";

export const copyFiles = async () => {
  for await (const file of [".eleventy.ts"]) {
    await copyFile(join(__dirname, "..", file), join(".", ".staart", file));
  }

  const files = await readdir(join("."));
  for await (const file of files) {
    if ((await lstat(join(".", file))).isFile())
      await copyFile(join(".", file), join(".", ".staart", file));
  }

  for await (const dir of ["eleventy", "src", "static", "data"]) {
    if (await pathExists(join(__dirname, "..", dir)))
      await copy(join(__dirname, "..", dir), join(".", ".staart", dir), {
        recursive: true,
      });
    if (await pathExists(join(".", dir)))
      await copy(join(".", dir), join(".", ".staart", dir), {
        recursive: true,
      });
  }

  for await (const dir of ["content"]) {
    await mkdirp(join(".", dir));
    const content = await recursiveReaddir(join(".", dir));
    for await (const file of content) {
      if ((await lstat(join(".", file))).isFile()) {
        await ensureFile(
          join(".", ".staart", "src", replaceStart(file, `${dir}/`, ""))
        );
        await copyFile(
          join(".", file),
          join(".", ".staart", "src", replaceStart(file, `${dir}/`, ""))
        );
      }
    }
  }
};

export const copyDoodles = async (config: any) => {
  const doodles = await readdir(join(".", ".staart", "static", "doodles"));
  for await (const doodle of doodles) {
    await writeFile(
      join(".", ".staart", "static", "doodles", doodle),
      (
        await readFile(
          join(".", ".staart", "static", "doodles", doodle),
          "utf8"
        )
      )
        .replace(/#000/g, (config.theme || {}).doodleBorderColor || "#000")
        .replace(
          /#123456/g,
          (config.theme || {}).doodleFillColor ||
            (config.theme || {}).buttonBackgroundColor ||
            "#123456"
        )
    );
  }
};
