import { join } from "path";
import { ensureDir, copyFile, copy, readdir } from "fs-extra";
import {
  CompilerOptions,
  createProgram,
  getPreEmitDiagnostics,
  flattenDiagnosticMessageText,
} from "typescript";

const compile = (fileNames: string[], options: CompilerOptions) => {
  const program = createProgram(fileNames, options);
  const emitResult = program.emit();
  const allDiagnostics = getPreEmitDiagnostics(program).concat(
    emitResult.diagnostics
  );
  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start!
      );
      let message = flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
  });
};

const staart = async () => {
  await ensureDir(join(".", ".staart"));
  const files = await readdir(join("."));
  for await (const file of files) {
    await copyFile(join(".", file), join(".", ".staart", file));
  }
  for await (const dir of ["eleventy", "src"]) {
    await copy(join(".", dir), join(".", ".staart", dir));
  }
  compile([join(".", ".staart", ".eleventy.ts")], {
    esModuleInterop: true,
  });
};

staart();
