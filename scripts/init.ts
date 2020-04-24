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
  await ensureDir(join(".", ".staart", "data"));
  if (pathExists(join(".", ".staartrc")))
    await copyFile(
      join(".", ".staartrc"),
      join(".", ".staart", "data", "config.json")
    );

  for await (const dir of ["content"]) {
    await mkdirp(join(".", dir));
    const content = await recursiveReaddir(join(".", dir));
    for await (const file of content) {
      if ((await lstat(join(".", file))).isFile())
        await copyFile(
          join(".", file),
          join(".", ".staart", "src", replaceStart(file, `${dir}/`, ""))
        );
    }
  }

  compile([join(".", ".staart", ".eleventy.ts")], {
    esModuleInterop: true,
  });
  await remove(join(".", ".staart", ".eleventy.ts"));
};

export const watcher = (onChange?: Function) => {
  ["src", "static", "eleventy", "content", ".staartrc"].forEach((dir) =>
    watch(
      join(__dirname, "..", dir),
      { recursive: true },
      (event: string, file: string) => {
        console.log(event, file);
        if (event === "change") {
          try {
            copyFileSync(
              join(__dirname, "..", dir, file),
              join(".", ".staart", dir, file)
            );
          } catch (error) {}
        } else {
          try {
            removeSync(join(".", ".staart", __dirname, "..", dir, file));
            copyFileSync(
              join(__dirname, "..", dir, file),
              join(".", ".staart", dir, file)
            );
          } catch (error) {}
        }
        if (onChange) onChange();
      }
    )
  );
};
