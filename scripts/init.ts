import {
  copyFileSync,
  mkdir,
  pathExistsSync,
  remove,
  removeSync,
  watch,
  writeFile,
} from "fs-extra";
import { join } from "path";
import recursiveReaddir from "recursive-readdir";
import { generateBreadcrumbs } from "./helpers/breadcrumbs";
import { createPackageJson } from "./helpers/config";
import { copyDoodles, copyFiles } from "./helpers/copy-files";
import { updateMarkdownFiles } from "./helpers/markdown";
import { generatePages } from "./helpers/pages";
import { generateSubpages } from "./helpers/subpages";
import { compile } from "./helpers/typescript";
import { replaceStart } from "./util";
export { revert } from "./helpers/config";

export const init = async () => {
  await remove(join(".", ".staart"));
  await remove(join(".", ".dist"));
  await mkdir(join(".", ".staart"));

  await copyFiles();
  await updateMarkdownFiles();

  const config = await createPackageJson();

  compile([join(".", ".staart", ".eleventy.ts")], {
    esModuleInterop: true,
    resolveJsonModule: true,
  });
  await remove(join(".", ".staart", ".eleventy.ts"));

  const cssFiles = (
    await recursiveReaddir(join(".", ".staart", "src"))
  ).filter((i) => i.endsWith(".css"));
  await writeFile(
    join(".", ".staart", "src", "includes", "inline-css.njk"),
    `
      {% include "style/properties.njk" %}

      ${cssFiles
        .map(
          (i) =>
            `{% include "${replaceStart(i, ".staart/src/includes/", "")}" %}`
        )
        .join("\n")}
    `
  );

  await generateSubpages(config);

  if (!config.disableBreadcrumbs) await generateBreadcrumbs();
  await copyDoodles(config);

  await generatePages(config);
};

export const watcher = (onChange?: Function) => {
  [[__dirname, ".."], ["."]].forEach((prefix) => {
    [
      "src",
      "static",
      "eleventy",
      "content",
      "package.json",
      "redirects.yml",
    ].forEach((dir) => {
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
