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
import { replaceStart, getTitleFromFile } from "./util";

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

  const content = await recursiveReaddir(join(".", ".staart", "src"));
  for await (const file of content) {
    if (file.endsWith(".md")) {
      const fileContents = await readFile(
        join(".", replaceStart(file, `src/`, "")),
        "utf8"
      );
      const lines = fileContents.split("\n");
      if (!lines[0].includes("---")) {
        const title = lines[0].replace("#", "").trim();
        const firstLine = lines.shift();
        await writeFile(
          join(".", replaceStart(file, `src/`, "")),
          `---
title: "${title}"
layout: page
---

${fileContents.replace(`${firstLine}\n`, "")}`
        );
      } else {
        const title = lines.find((i) => i.startsWith("# "))?.replace("# ", "");
        if (
          !(lines.find((i, x) => x < 10 && i.startsWith("layout:")) || [])
            .length
        )
          lines[1] += "\nlayout: page";
        if (
          !(lines.find((i, x) => x < 10 && i.startsWith("title:")) || []).length
        ) {
          if (title) lines[1] += `\ntitle: "${title}"`;
        }
        await writeFile(
          join(".", replaceStart(file, `src/`, "")),
          lines.filter((i) => !i.startsWith(`# ${title}`)).join("\n")
        );
      }
    }
  }

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

  const config = (await readJson(join(".", "package.json")))["@staart/site"];

  const listSubpages: string[] | boolean = config.listSubpages;
  let pagesToSub: string[] = [];
  if (listSubpages) {
    if (Array.isArray(listSubpages)) {
      pagesToSub = listSubpages.map((i) => join(".", ".staart", "src", i));
    } else {
      pagesToSub = (
        await recursiveReaddir(join(".", ".staart", "src"))
      ).filter((i) => i.endsWith("index.md"));
      if (config.ignoreHomeSubpages)
        pagesToSub = pagesToSub.filter((i) => i !== ".staart/src/index.md");
    }
  }
  for await (const file of pagesToSub) {
    const subFiles = (await readdir(join(file, ".."))).filter(
      (i) => i.endsWith(".md") && !i.endsWith("index.md")
    );
    if (subFiles.length > 1) {
      let list = "";
      for await (const subFile of subFiles) {
        list += `- [${
          (await getTitleFromFile(
            join(".", file.replace(".md", ""), subFile).replace("index/", "")
          )) || subFile
        }](./${subFile.replace(".md", "")})\n`;
      }
      await writeFile(
        join(".", replaceStart(file, `src/`, "")),
        (await readFile(join(".", replaceStart(file, `src/`, "")), "utf8")) +
          "\n\n" +
          list
      );
    }
  }

  if (!config.disableBreadcrumbs) {
    const files = (
      await recursiveReaddir(join(".", ".staart", "src"))
    ).filter((i) => i.endsWith(".md"));
    for await (const file of files) {
      const parts = file.replace(".staart/src/", "").split("/");
      if (
        parts.length > 1 &&
        parts[0] !== "@" &&
        parts[parts.length - 1] !== "index.md"
      ) {
        const list: string[] = [];
        for await (const part of parts) {
          const path = join(
            ".",
            ".staart",
            "src",
            parts.join("/").split(part)[0]
          ).replace("index/", "");
          if (path !== ".staart/src") {
            try {
              const title = await getTitleFromFile(path + "index.md");
              if (title)
                list.push(
                  `<a itemprop="item" href="${path.replace(
                    ".staart/src",
                    ""
                  )}"><span itemprop="name">${title}</span></a>`
                );
            } catch (error) {}
          }
        }
        await writeFile(
          join(".", replaceStart(file, `src/`, "")),
          (await readFile(join(".", replaceStart(file, `src/`, "")), "utf8"))
            .split("\n")
            .map((i, index) => {
              if (index < 10 && i.startsWith("title: ")) {
                i += `\nbreadcrumbs: ${JSON.stringify(list)}`;
              }
              return i.trim();
            })
            .join("\n")
        );
      }
    }
  }

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

  const pages = config.pages || {};
  for await (const path of Object.keys(pages)) {
    const page = path.endsWith("/") ? `${path}index.njk` : `${path}.njk`;
    await ensureFile(join(".", ".staart", "src", page));
    let pageContents = "---json\n";
    let data: any = { layout: "base", ...pages[path] };
    if (data.frontMatter) data = { ...data, ...data.frontMatter };
    delete data.frontMatter;
    data.components.forEach((component: any, index: number) => {
      Object.keys(component).forEach((key) => {
        data[`component_${index}_${key}`] = component[key];
      });
    });
    delete data.components;
    pageContents += JSON.stringify(data, null, 2) + "\n";
    pageContents += "---\n";
    let index = 0;
    for await (const component of pages[path].components || []) {
      const componentsHtml = await readFile(
        join(
          ".",
          ".staart",
          "src",
          "includes",
          "components",
          component.type,
          `${component.type}.njk`
        ),
        "utf8"
      );
      pageContents +=
        componentsHtml.replace(/component\_/g, `component_${index}_`) + "\n";
      index++;
    }
    await writeFile(join(".", ".staart", "src", page), pageContents);
  }
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
