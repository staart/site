import { getConfig, readPackage } from "./config";
import { compile } from "handlebars";
import { renderMd } from "./parse";

const ucFirst = (string: string) =>
  `${string.charAt(0).toUpperCase()}${string.slice(1)}`;

export const getSiteMeta = async (
  configKey: string,
  pkgKey?: string
): Promise<string> => {
  const config = await getConfig();
  if (config[configKey]) return config[configKey];
  const pkg = await readPackage();
  if (pkg && pkg[pkgKey || configKey]) return pkg[pkgKey || configKey];
  return ucFirst(configKey);
};

export const getData = async () => {
  const config = await getConfig();
  config.data = config.data || {};
  if (!config.ignoreReplaceTitle)
    config.data.title = await getSiteMeta("title", "name");
  if (!config.ignoreReplaceDescription)
    config.data.description = await getSiteMeta("description");
  if (!config.ignoreReplaceAuthor)
    config.data.author = (await getSiteMeta("author")).split(" <")[0];
  if (!config.ignoreReplaceYear)
    config.data.year = new Date().getFullYear().toString();
  return config;
};

export const renderHb = async (content: string) => {
  const template = compile(
    content.replace(new RegExp("/*{{css}}*/", "g"), "{{css}}")
  );
  return template(await getData());
};

export const render = async (content: string) => {
  return renderMd(await renderHb(content));
};
