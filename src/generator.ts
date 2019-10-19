import { ensureDir, readFile, writeFile, ensureFile } from "fs-extra";
import {
  getDistPath,
  getTemplatePath,
  getStylePath,
  getHomePath,
  getContentPath,
  listContentFiles,
  readContentFile,
  listDirs
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
import { StaartSiteConfig } from "./interfaces";
import { getLastCommit, getGitHubRepoUrl } from "./github";

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

const addTheme = async (css: string) => {
  const config = await getConfig();
  return css
    .replace(
      "$theme-color: #0e632c",
      `$theme-color: ${config.themeColor || "#0e632c"}`
    )
    .replace(
      "$text-color: #e3fde4",
      `$text-color: ${config.textColor || "#e3fde4"}`
    )
    .replace(
      "$link-color: #0e632a",
      `$link-color: ${config.linkColor || config.themeColor || "#0e632a"}`
    )
    .replace(
      "$light-color: #fff",
      `$light-color: ${config.lightColor || "#fff"}`
    );
};
export const getCss = async () => {
  return await cached<string>("css", async () => {
    try {
      return await renderScss(
        await addTheme((await readFile(await getStylePath())).toString())
      );
    } catch (error) {
      return await renderScss(
        await addTheme(
          (await readFile(
            join(__dirname, "..", "src", "style.scss")
          )).toString()
        )
      );
    }
  });
};

export const generate = async (customConfig?: StaartSiteConfig) => {
  ensureDir(await getDistPath());
  const config = await getConfig(customConfig);
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
  if (!config.noShieldSchema) {
    const schema = {
      schemaVersion: 1,
      message: "",
      label: config.shieldSchemaLabel || "docs",
      color: config.shieldSchemaColor || "blueviolet"
    };
    await ensureDir(join(await getDistPath(), "shield-schema"));
    const nArticles = (await listContentFiles()).length;
    schema.message = `${nArticles} article${nArticles !== 1 ? "s" : ""}`;
    await writeFile(
      join(await getDistPath(), "shield-schema", "site.json"),
      JSON.stringify(schema)
    );
    const directories = await listDirs();
    for await (const directory of directories) {
      await ensureDir(join(await getDistPath(), "shield-schema"));
      const nArticles = (await listContentFiles(directory)).length;
      schema.message = `${nArticles} article${nArticles !== 1 ? "s" : ""}`;
      await writeFile(
        join(
          await getDistPath(),
          "shield-schema",
          `${directory.replace(/\//g, "_")}.json`
        ),
        JSON.stringify(schema)
      );
    }
  }
};

const generateSitemap = async () => {
  const files = await listContentFiles();
  const config = await getConfig();
  let content = (await getSitemapContent()) + "\n\n" + (await getNavbar(files));
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
  const config = await getConfig();
  if (!config.noLastModified) {
    const lastCommit = await getLastCommit(path);
    const githubUrl = await getGitHubRepoUrl();
    if (lastCommit)
      content += `\n\n<p class="post-footer">This page was last modified in <a href="${
        lastCommit.html_url
      }" target="_blank">${lastCommit.sha.substr(0, 6)}</a> by <a href="${
        lastCommit.author.html_url
      }" target="_blank">${
        lastCommit.commit.author.name
      }</a> on <time datetime="${lastCommit.commit.author.date}">${new Date(
        lastCommit.commit.author.date
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })}</time>. <a href="${
        githubUrl
          ? `${githubUrl}/blob/master/content/${path.replace(".html", ".md")}`
          : ""
      }"  target="_blank">Edit on GitHub</a></p>`;
  }
  const template = compile(await getTemplate());
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
