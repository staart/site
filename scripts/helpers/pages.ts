import { ensureFile, readFile, writeFile } from "fs-extra";
import { join } from "path";

export const generatePages = async (config: any) => {
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
