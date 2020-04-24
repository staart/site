import { join } from "path";
import { mkdir, copyFile, copy, readdir, remove, lstat } from "fs-extra";
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
  await mkdir(join(".", ".staart"));

  const files = await readdir(join("."));
  for await (const file of files) {
    if ((await lstat(join(".", file))).isFile())
      await copyFile(join(".", file), join(".", ".staart", file));
  }

  for await (const dir of ["eleventy", "src"]) {
    await copy(join(".", dir), join(".", ".staart", dir));
  }

  for await (const dir of ["content", "static"]) {
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
