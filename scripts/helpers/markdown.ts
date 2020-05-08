import { readFile, writeFile } from "fs-extra";
import { join } from "path";
import recursiveReaddir from "recursive-readdir";
import { replaceStart } from "../util";

export const updateMarkdownFiles = async () => {
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
};
