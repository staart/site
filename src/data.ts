import { getConfig, readPackage } from "./config";
import { compile } from "handlebars";
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

export const getNavbar = async (files?: string[]) => {
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
      data += `- [${title}](/${file.replace(".md", ".html")})\n`;
    }
  }
  return data;
};

export const getData = async () => {
  const result = await cached<{ [index: string]: any }>("data", async () => {
    const config = await getConfig();
    config.data = config.data || {};
    if (config._gitRepo)
      config.data.githubUrl = `[open source](https://${config._gitRepo.resource}/${config._gitRepo.full_name})`;
    config.data.rootFiles = await getNavbar();
    config.data.navBar = await getNavbar(config.navbar);
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
      const listOfFiles = (await recursiveReadDir(
        join(await getContentPath(), "..", config.assetsDir || "assets")
      )).map(f => f.replace(/\//g, "_").replace(/\./g, "_"));
      listOfFiles.forEach(file => {
        assets[file] = true;
      });
    } catch (error) {}
    return { ...config, ...config.data, ...assets };
  });
  if (result) return result;
  throw new Error("Could not generate data");
};

export const renderHb = async (content: string) => {
  const template = compile(
    content.replace(new RegExp("/*{{css}}*/", "g"), "{{css}}")
  );
  return template(await getData());
};

export const render = async (content: string, avoidParagraphs = false) => {
  return renderMd(await renderHb(content), avoidParagraphs);
};
