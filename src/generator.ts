import { ensureDir, readFile, writeFile } from "fs-extra";
import { getDistPath, getTemplatePath, getStylePath } from "./files";
import { cached } from "./cache";
import { join } from "path";
import { compile } from "handlebars";
import { getData } from "./data";
import { minify } from "html-minifier";
import { render } from "sass";

export const getTemplate = async (): Promise<string> => {
  return cached("template", async () => {
    try {
      return (await readFile(await getTemplatePath())).toString();
    } catch (error) {
      return (await readFile(
        join(__dirname, "..", "src", "index.html")
      )).toString();
    }
  });
};

const renderScss = (scss: string): Promise<string> =>
  new Promise((resolve, reject) => {
    render({ data: scss }, (error, result) => {
      if (error) return reject(error);
      resolve(result.css.toString());
    });
  });
export const getCss = async (): Promise<string> => {
  // return cached("css", async () => {
  try {
    return await renderScss((await readFile(await getStylePath())).toString());
  } catch (error) {
    return await renderScss(
      (await readFile(join(__dirname, "..", "src", "style.scss"))).toString()
    );
  }
  // });
};

export const generate = async () => {
  ensureDir(await getDistPath());

  // Generate index.html
  const template = compile(
    (await getTemplate()).replace(new RegExp("/*{{css}}*/", "g"), "{{css}}")
  );
  const result = template({
    ...(await getData()),
    css: await getCss()
  });
  await writeFile(
    join(await getDistPath(), "index.html"),
    minify(result, { collapseWhitespace: true })
  );
};
