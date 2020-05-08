import { readFile, writeFile } from "fs-extra";
import { join } from "path";
import recursiveReaddir from "recursive-readdir";
import { getTitleFromFile, replaceStart } from "../util";

export const generateBreadcrumbs = async () => {
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
};
