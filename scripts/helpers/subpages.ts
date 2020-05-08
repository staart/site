import { readdir, readFile, writeFile } from "fs-extra";
import { join } from "path";
import recursiveReaddir from "recursive-readdir";
import { getTitleFromFile, replaceStart } from "../util";

export const generateSubpages = async (config: any) => {
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
};
