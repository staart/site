import { getConfig, readPackage } from "./config";
import { compile, registerPartial } from "handlebars";
import { renderMd, getTitle } from "./parse";
import {
  listRootFiles,
  readContentFile,
  getContentPath,
  getTemplatePartsList,
  getTemplatePart
} from "./files";
import { cached } from "./cache";
import recursiveReadDir = require("recursive-readdir");
import { join } from "path";
import { filePathtoUrl } from "./helpers";

export const getSiteMeta = async (
  configKey: string,
  pkgKey?: string
): Promise<string> => {
  const config = await getConfig();
  if (config[configKey]) return config[configKey];
  const pkg = await readPackage();
  if (pkg && pkg[pkgKey || configKey]) return pkg[pkgKey || configKey];
  return "";
};

export const getNavbar = async (files?: string[], addSearch = false) => {
  const config = await getConfig();
  if (!files)
    files = (await listRootFiles())
      .sort((a, b) => a.localeCompare(b))
      .reverse();
  let data = "";
  for await (const file of files) {
    if (file.startsWith("[")) {
      data += `- ${file}\n`;
    } else {
      const md = await readContentFile(file);
      const title = await getTitle(md);
      data += `- [${title}](/${await filePathtoUrl(file)})\n`;
    }
  }
  if (addSearch && config.algoliaApiKey)
    data += `<li class="search-li"><label for="docsSearch" class="sr-only">Search</label><input placeholder="Search docs..." type="search" class="docs-search" id="docsSearch"></li>`;
  return data;
};

export const getData = async () => {
  const result = await cached<{ [index: string]: any }>("data", async () => {
    const config = await getConfig();
    config.data = config.data || {};
    if (config._gitRepo)
      config.data.githubUrl = `[open source](https://${config._gitRepo.resource}/${config._gitRepo.full_name})`;
    config.data.rootFiles = await getNavbar();
    config.data.navBar = await getNavbar(config.navbar, true);
    config.data.footerNavBar = await getNavbar(config.footerNavbar || []);
    if (!config.ignoreReplaceTitle)
      config.data.title = await getSiteMeta("title", "name");
    if (!config.ignoreReplaceDescription)
      config.data.description = await getSiteMeta("description");
    if (!config.ignoreReplaceAuthor)
      config.data.author = (await getSiteMeta("author")).split(" <")[0];
    if (!config.ignoreReplaceYear)
      config.data.year = new Date().getFullYear().toString();
    let assets: any = {};
    try {
      const listOfFiles = (
        await recursiveReadDir(
          join(await getContentPath(), "..", config.assetsDir || "assets")
        )
      ).map(f => f.replace(/\//g, "_").replace(/\./g, "_"));
      listOfFiles.forEach(file => {
        assets[file] = true;
      });
    } catch (error) {}
    return { ...config, ...config.data, ...assets };
  });
  if (result) return result;
  throw new Error("Could not generate data");
};

export const registerPartials = async () => {
  const templateParts = await getTemplatePartsList();
  // First register partials which don't depend on other partials
  for await (const templatePart of templateParts) {
    const content = (await getTemplatePart(templatePart)) || "";
    if (!content.includes("{{>")) registerPartial(templatePart, content);
  }
  // Then register partials
  for await (const templatePart of templateParts) {
    const content = (await getTemplatePart(templatePart)) || "";
    if (content.includes("{{>")) registerPartial(templatePart, content);
  }
};

export const renderHb = async (content: string) => {
  await registerPartials();
  const template = compile(
    content.replace(new RegExp("/*{{css}}*/", "g"), "{{css}}")
  );
  return template(await getData());
};

export const render = async (content: string, avoidParagraphs = false) => {
  return renderMd(await renderHb(content), avoidParagraphs);
};
