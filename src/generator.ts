import { ensureDir, readFile, writeFile, ensureFile } from "fs-extra";
import {
  getDistPath,
  getTemplatePath,
  getStylePath,
  getHomePath,
  getContentPath,
  listContentFiles,
  readContentFile
} from "./files";
import { cached } from "./cache";
import { join, parse } from "path";
import { compile } from "handlebars";
import { getData, render, getNavbar } from "./data";
import { minify } from "html-minifier";
import { render as scss } from "sass";
import { removeHeading } from "./parse";
import { getConfig } from "./config";
import { SitemapStream, streamToPromise } from "sitemap";

export const getTemplate = async () => {
  const result = await cached<string>("template", async () => {
    try {
      return (await readFile(await getTemplatePath())).toString();
    } catch (error) {
      return (await readFile(
        join(__dirname, "..", "src", "index.html")
      )).toString();
    }
  });
  if (result) return result;
  throw new Error("Template not found");
};

export const getHomeContent = async () => {
  const result = await cached<string>("home", async () => {
    try {
      return (await readFile(await getHomePath())).toString();
    } catch (error) {
      return (await readFile(
        join(__dirname, "..", "src", "index.md")
      )).toString();
    }
  });
  if (result) return result;
  throw new Error("Homepage not found");
};

export const getSitemapContent = async () => {
  const result = await cached<string>("sitemap", async () => {
    try {
      return (await readFile(
        join(await getContentPath(), "sitemap.md")
      )).toString();
    } catch (error) {}
  });
  if (result) return result;
  return `# Sitemap`;
};

const renderScss = (styles: string) =>
  new Promise((resolve, reject) => {
    scss({ data: styles }, (error, result) => {
      if (error) return reject(error);
      resolve(result.css.toString());
    });
  });
export const getCss = async () => {
  const config = await getConfig();
  return (await cached<string>("css", async () => {
    try {
      return await renderScss(
        (await readFile(await getStylePath())).toString()
      );
    } catch (error) {
      return await renderScss(
        (await readFile(join(__dirname, "..", "src", "style.scss"))).toString()
      );
    }
  }))
    .replace("$theme: #0e632c", `$theme: ${config.themeColor || "#0e632c"};`)
    .replace(
      "$text-color: #001b01",
      `$text-color: ${config.textColor || "#001b01"};`
    )
    .replace(
      "$link-color: #0e632c",
      `$link-color: ${config.linkColor || "#0e632c"};`
    )
    .replace(
      "$light-color: #fff",
      `$light-color: ${config.lightColor || "#fff"};`
    );
};

export const generate = async () => {
  ensureDir(await getDistPath());
  const config = await getConfig();
  if (!config.noHome) await generatePage("index.html", await getHomeContent());
  if (!config.noSitemap) await generateSitemap();
  const files = (await listContentFiles()).filter(
    file => !["index.md", "sitemap.md"].includes(file)
  );
  for await (const file of files) {
    let content = await readContentFile(file);
    if (parse(file).name === "index" && !config.noContentList) {
      const deepFiles = (await listContentFiles(join(file, "..")))
        .filter(f => f !== "index.md")
        .map(f => join(file, "..", f));
      if (deepFiles.length) {
        content += "\n\n" + (await getNavbar(deepFiles));
      }
    }
    await generatePage(file.replace(".md", ".html"), content);
  }
};

const generateSitemap = async () => {
  const files = await listContentFiles();
  const config = await getConfig();
  let content =
    (await getSitemapContent()) +
    "\n\n" +
    (config.navbar || (await getNavbar(files)));
  await generatePage("sitemap.html", content);
  const sitemap = new SitemapStream({
    hostname: config.hostname || "http://localhost:8080"
  });
  files.forEach(file => {
    sitemap.write(file.replace(".md", ".html"));
  });
  sitemap.end();
  await writeFile(
    join(await getDistPath(), "sitemap.xml"),
    await streamToPromise(sitemap)
  );
};

const generatePage = async (path: string, content: string) => {
  const template = compile(await getTemplate());
  const config = await getConfig();
  const data: { [index: string]: any } = {
    ...(await getData()),
    content:
      path === "index.html"
        ? config.keepHomeHeading
          ? content
          : await removeHeading(content)
        : content
  };
  for await (const key of Object.keys(data)) {
    if (typeof data[key] === "string")
      data[key] = await render(data[key], key !== "content");
  }
  data.css = await getCss();
  const result = template(data);
  await ensureFile(join(await getDistPath(), path));
  await writeFile(
    join(await getDistPath(), path),
    minify(result, {
      collapseWhitespace: true,
      processScripts: ["application/ld+json"],
      minifyCSS: true
    })
  );
};
