import { ensureDir, readFile, writeFile } from "fs-extra";
import {
  getDistPath,
  getTemplatePath,
  getStylePath,
  getHomePath
} from "./files";
import { cached } from "./cache";
import { join } from "path";
import { compile } from "handlebars";
import { getData, render } from "./data";
import { minify } from "html-minifier";
import { render as scss } from "sass";
import { removeHeading } from "./parse";
import { getConfig } from "./config";

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

export const getHomeContent = async (): Promise<string> => {
  return cached("home", async () => {
    try {
      return (await readFile(await getHomePath())).toString();
    } catch (error) {
      return (await readFile(
        join(__dirname, "..", "src", "index.md")
      )).toString();
    }
  });
};

const renderScss = (styles: string): Promise<string> =>
  new Promise((resolve, reject) => {
    scss({ data: styles }, (error, result) => {
      if (error) return reject(error);
      resolve(result.css.toString());
    });
  });
export const getCss = async (): Promise<string> => {
  return cached("css", async () => {
    try {
      return await renderScss(
        (await readFile(await getStylePath())).toString()
      );
    } catch (error) {
      return await renderScss(
        (await readFile(join(__dirname, "..", "src", "style.scss"))).toString()
      );
    }
  });
};

export const generate = async () => {
  ensureDir(await getDistPath());

  // Generate index.html
  const template = compile(await getTemplate());
  const homeContent = await getHomeContent();
  const config = await getConfig();
  const data = {
    ...(await getData()),
    content: config.keepHomeHeading
      ? homeContent
      : await removeHeading(homeContent)
  };
  for await (const key of Object.keys(data)) {
    if (typeof data[key] === "string")
      data[key] = await render(data[key], key !== "content");
  }
  data.css = await getCss();
  const result = template(data);
  await writeFile(
    join(await getDistPath(), "index.html"),
    minify(result, {
      collapseWhitespace: true,
      processScripts: ["application/ld+json"],
      minifyCSS: true
    })
  );
};
