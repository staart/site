import {
  ensureDir,
  readFile,
  writeFile,
  ensureFile,
  copyFile,
  copy,
  remove
} from "fs-extra";
import {
  getDistPath,
  getTemplatePath,
  getStylePath,
  getHomePath,
  getContentPath,
  listContentFiles,
  readContentFile,
  listDirs,
  getScriptPath,
  getBreadcrumbs,
  getBreadcrumbsSchema,
  getNextPreviousNav
} from "./files";
import { cached } from "./cache";
import { join, parse } from "path";
import { compile } from "handlebars";
import {
  getData,
  render,
  getNavbar,
  getSiteMeta,
  registerPartials
} from "./data";
import { minify } from "html-minifier";
import { render as scss } from "sass";
import { removeHeading, getTitle, getTags, getFilesForTag } from "./parse";
import { getConfig } from "./config";
import { SitemapStream, streamToPromise } from "sitemap";
import { StaartSiteConfig } from "./interfaces";
import { getLastCommit, getGitHubRepoUrl } from "./github";
import { parse as yaml } from "yaml";
import frontMatter from "front-matter";
import removeMarkdown from "remove-markdown";
import { FrontMatter } from "./interfaces";
import truncate from "truncate";
import { unslugify } from "./util";
import { getAboutAuthor, listAuthorFiles } from "./content";
import { filePathtoUrl } from "./helpers";

export const getTemplate = async () => {
  let result = await cached<string>("template", async () => {
    try {
      return (await readFile(await getTemplatePath())).toString();
    } catch (error) {
      return (
        await readFile(join(__dirname, "..", "src", "index.html"))
      ).toString();
    }
  });
  if (!result) throw new Error("Template not found");
  return result;
};

export const getHomeContent = async () => {
  const result = await cached<string>("home", async () => {
    try {
      return (await readFile(await getHomePath())).toString();
    } catch (error) {
      return (
        await readFile(join(__dirname, "..", "src", "index.md"))
      ).toString();
    }
  });
  if (result) return result;
  throw new Error("Homepage not found");
};

export const getSitemapContent = async () => {
  const result = await cached<string>("sitemap", async () => {
    try {
      return (
        await readFile(join(await getContentPath(), "sitemap.md"))
      ).toString();
    } catch (error) {}
  });
  if (result) return result;
  return `# Sitemap`;
};

export const getRedirectsContent = async (): Promise<string[]> => {
  const result = await cached<string>("redirects", async () => {
    try {
      const config = await getConfig();
      return (
        await readFile(
          config.redirectsPath ||
            join(await getContentPath(), "..", "redirects.yml")
        )
      ).toString();
    } catch (error) {}
  });
  if (result) return yaml(result);
  return [];
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
          (
            await readFile(join(__dirname, "..", "src", "style.scss"))
          ).toString()
        )
      );
    }
  });
};

export const getScript = async () => {
  return await cached<string>("script", async () => {
    return (await readFile(await getScriptPath())).toString();
  });
};

const copyAssets = async () => {
  const config = await getConfig();
  const assetsPath = join(await getDistPath(), "assets");
  await ensureDir(assetsPath);
  try {
    await copy(
      join(await getContentPath(), "..", config.assetsDir || "assets"),
      assetsPath
    );
  } catch (error) {}
};

export const generate = async (customConfig?: StaartSiteConfig) => {
  ensureDir(await getDistPath());
  const config = await getConfig(customConfig);
  if (!config.noHome) await generatePage("index.html", await getHomeContent());
  if (!config.noSitemap) await generateSitemap();
  const files = (await listContentFiles()).filter(
    file => !["index.md", "sitemap.md"].includes(file)
  );
  const allTags = await getTags();
  const tags: typeof allTags = {};
  Object.keys(allTags).forEach(tag => {
    tags[tag] = allTags[tag];
  });
  for await (const key of Object.keys(tags)) {
    const values = tags[key];
    let content = "";
    const valueLinks: string[] = [];
    for await (const value of values) {
      let title = "";
      try {
        title =
          (await getTitle(await readContentFile(`tags/${key}/${value}.md`))) ||
          unslugify(value);
      } catch (error) {
        title = unslugify(value);
      }
      valueLinks.push(
        `[${title}](${await filePathtoUrl(`${key}/${value}.md`)})`
      );
    }
    const filesList = await getNavbar(valueLinks);
    try {
      const fileContent = await readContentFile(`tags/${key}/index.md`);
      content = fileContent + "\n\n" + filesList;
    } catch (error) {
      content = `# ${unslugify(key)}

${filesList}`;
    }
    await generatePage(`${key}/index.html`, content);
    for await (const value of values) {
      let content = "";
      const files = await getFilesForTag(key, value);
      const filesList = await getNavbar(files);
      try {
        const fileContent = await readContentFile(`tags/${key}/${value}.md`);
        content = fileContent + "\n\n" + filesList;
      } catch (error) {
        content = `# ${unslugify(value)}

${filesList}`;
      }
      await generatePage(`${key}/${value}.html`, content);
    }
  }
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
    if (!parse(file).dir.startsWith("tags/")) {
      await generatePage(file.replace(".md", ".html"), content);
    }
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
      join(await getDistPath(), "shield-schema", "all.json"),
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
    await ensureDir(join(await getDistPath(), "assets"));
    if (!config.noSyntaxHighlighting) {
      await copyFile(
        join(__dirname, "..", "src", "prism.js"),
        join(await getDistPath(), "assets", "prism.js")
      );
      await copyFile(
        join(__dirname, "..", "src", "prism.css"),
        join(await getDistPath(), "assets", "prism.css")
      );
    }
    await copyFile(
      join(__dirname, "..", "src", "staart.js"),
      join(await getDistPath(), "assets", "staart.js")
    );
  }
  try {
    const userFiles = await listContentFiles("@");
    for await (const file of userFiles) {
      await copyFile(
        join(await getDistPath(), `@/${file.replace(".md", ".html")}`),
        join(await getDistPath(), `@${file.replace(".md", ".html")}`)
      );
    }
    await remove(join(await getDistPath(), "@"));
  } catch (error) {}
  await copyAssets();
};

const generateSitemap = async () => {
  const files = await listContentFiles();
  const config = await getConfig();
  let content = (await getSitemapContent()) + "\n\n" + (await getNavbar(files));
  await generatePage("sitemap.html", content);
  const sitemap = new SitemapStream({
    hostname: config.baseUrl || "http://localhost:8080"
  });
  for await (const file of files) {
    let newFile = file;
    if (file.startsWith("@")) newFile = file.replace("@/", "@");
    sitemap.write(newFile.replace(".md", ".html"));
  }
  sitemap.end();
  await writeFile(
    join(await getDistPath(), "sitemap.xml"),
    await streamToPromise(sitemap)
  );
  const redirects = await getRedirectsContent();
  for await (const rule of redirects) {
    const paths = rule.split(" ");
    if (paths.length < 2) break;
    const fromPath = paths[0].endsWith(".html") ? paths[0] : `${paths[0]}.html`;
    const toPath = paths[1];
    await ensureFile(join(await getDistPath(), fromPath));
    await writeFile(
      join(await getDistPath(), fromPath),
      minify(
        `
        <!doctype html>
        <html>
          <head>
            <meta http-equiv="refresh" content="0; URL='${toPath}'">
          </head>
          <body>
            <script>
              window.location = "${toPath}";
            </script>
            <!-- redirect rule -->
            <h1><a href="${toPath}">Click here if you are not redirected</a></h1>
          </body>
        </html>
      `,
        {
          collapseWhitespace: true,
          processScripts: ["application/ld+json"],
          minifyCSS: true
        }
      )
    );
  }
};

const generatePage = async (path: string, content: string) => {
  const config = await getConfig();
  let lastCommit;
  if (process.env.NODE_ENV === "production") {
    lastCommit = await getLastCommit(path);
    if (!config.noLastModified) {
      const githubUrl = await getGitHubRepoUrl();
      if (lastCommit && lastCommit.author && lastCommit.commit)
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
  }
  const breadcrumbs = (await getBreadcrumbs(path)) || "";
  const breadcrumbsSchema = (await getBreadcrumbsSchema(path)) || "";
  const template = compile(await getTemplate());
  const nextPrevious = await getNextPreviousNav(path);
  const attributes = frontMatter<FrontMatter>(content).attributes;
  attributes.postAuthor = attributes.author;
  delete attributes.author;
  const aboutAuthor = await getAboutAuthor(attributes.postAuthor);
  await registerPartials();
  const data: { [index: string]: any } = {
    ...(await getData()),
    content:
      path === "index.html"
        ? config.keepHomeHeading
          ? content
          : await removeHeading(content)
        : breadcrumbs +
          "\n\n" +
          (path.startsWith("@")
            ? frontMatter(content).body +
              (await getAboutAuthor(
                path
                  .split("/")
                  [path.split("/").length - 1].replace(".html", ""),
                true
              ))
            : frontMatter(content).body) +
          "\n\n" +
          (!config.noAboutAuthor ? aboutAuthor + "\n\n" : "") +
          (path.startsWith("@")
            ? await listAuthorFiles(
                path.split("/")[path.split("/").length - 1].replace(".html", "")
              )
            : "") +
          nextPrevious +
          "\n\n" +
          (path.startsWith("@") ? "" : breadcrumbsSchema),
    metaTitle:
      path === "index.html"
        ? (await getSiteMeta("title", "name")) || "Staart Site"
        : `${await getTitle(content, false)} · ${(await getSiteMeta(
            "title",
            "name"
          )) || "Staart Site"}`,
    ...attributes,
    description: truncate(
      path === "index.html"
        ? await getSiteMeta("description")
        : attributes.description
        ? attributes.description
        : removeMarkdown(frontMatter(content).body).replace(
            (await getTitle(content, false)) || "Staart Site",
            ""
          ),
      200
    )
  };
  if (process.env.NODE_ENV) {
    try {
      if (
        lastCommit &&
        lastCommit.firstCommit &&
        lastCommit.firstCommit.commit &&
        lastCommit.firstCommit.author
      ) {
        data.publishedTime = lastCommit.firstCommit.commit.author.date;
      }
      if (lastCommit && lastCommit.commit && lastCommit.author) {
        data.modifiedTime = lastCommit.commit.author.date;
      }
    } catch (error) {}
  }
  for await (const key of Object.keys(data)) {
    if (
      typeof data[key] === "string" &&
      !["seoImage", "canonical"].includes(key)
    )
      data[key] = await render(data[key], key !== "content");
  }
  if (!data.navBar) delete data.navBar;
  data.css = await getCss();
  data.script = await getScript();
  const result = template(data);
  await ensureFile(join(await getDistPath(), path));
  await writeFile(
    join(await getDistPath(), path),
    minify(result, {
      collapseWhitespace: true,
      processScripts: ["application/ld+json", "text/javascript"],
      minifyCSS: true
    })
  );
};
