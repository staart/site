import { join } from "path";
import {
  mkdir,
  copyFile,
  copy,
  readdir,
  remove,
  lstat,
  watch,
  copyFileSync,
  removeSync,
  pathExists,
  ensureDir,
  mkdirp,
  pathExistsSync,
  writeFile,
  readFile,
  readJson,
  ensureFile,
} from "fs-extra";
import recursiveReaddir from "recursive-readdir";
import {
  CompilerOptions,
  createProgram,
  getPreEmitDiagnostics,
  flattenDiagnosticMessageText,
} from "typescript";
import { replaceStart } from "./util";

const compile = (fileNames: string[], options: CompilerOptions) => {
  const program = createProgram(fileNames, options);
  const emitResult = program.emit();
  const allDiagnostics = getPreEmitDiagnostics(program).concat(
    emitResult.diagnostics
  );
  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start!
      );
      const message = flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
  });
};

export const init = async () => {
  await remove(join(".", ".staart"));
  await remove(join(".", ".dist"));
  await mkdir(join(".", ".staart"));

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

  compile([join(".", ".staart", ".eleventy.ts")], {
    esModuleInterop: true,
  });
  await remove(join(".", ".staart", ".eleventy.ts"));

  const cssFiles = (
    await recursiveReaddir(join(".", ".staart", "src"))
  ).filter((i) => i.endsWith(".css"));
  await writeFile(
    join(".", ".staart", "src", "includes", "inline-css.njk"),
    `
      {% include "style/properties.njk" %}

      {% include "style/type.css" %}
      {% include "style/layout.css" %}
      {% include "style/content.css" %}
      {% include "style/mobile.css" %}
      {% include "style/custom-css.css" %}

      ${cssFiles
        .map(
          (i) =>
            `{% include "${replaceStart(i, ".staart/src/includes/", "")}" %}`
        )
        .join("\n")}
    `
  );

  const config = (await readJson(join(".", "package.json")))["@staart/site"];
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
        .replace(/#000/g, config.doodleBorderColor || "#000")
        .replace(
          /#123456/g,
          config.doodleFillColor || config.themeColor || "#123456"
        )
    );
  }
};

export const watcher = (onChange?: Function) => {
  [[__dirname, ".."], ["."]].forEach((prefix) => {
    ["src", "static", "eleventy", "content"].forEach((dir) => {
      if (pathExistsSync(join(...prefix, dir)))
        watch(
          join(...prefix, dir),
          { recursive: true },
          (event: string, file: string) => {
            console.log(event, file);
            if (event === "change") {
              try {
                copyFileSync(
                  join(...prefix, dir, file),
                  join(".", ".staart", dir, file)
                );
              } catch (error) {}
            } else {
              try {
                removeSync(join(".", ".staart", ...prefix, dir, file));
                copyFileSync(
                  join(...prefix, dir, file),
                  join(".", ".staart", dir, file)
                );
              } catch (error) {}
            }
            if (onChange) onChange();
          }
        );
    });
  });
};
