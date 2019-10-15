import { getConfig, readPackage } from "./config";

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

export const addData = async (html: string) => {
  const config = await getConfig();
  if (!config.ignoreReplaceTitle)
    html = html.replace(
      new RegExp("<!--title-->", "g"),
      await getSiteMeta("title", "name")
    );
  if (!config.ignoreReplaceDescription)
    html = html.replace(
      new RegExp("<!--description-->", "g"),
      await getSiteMeta("description")
    );
  if (!config.ignoreReplaceAuthor)
    html = html.replace(
      new RegExp("<!--author-->", "g"),
      (await getSiteMeta("author")).split(" <")[0]
    );
  if (!config.ignoreReplaceYear)
    html = html.replace(
      new RegExp("<!--year-->", "g"),
      new Date().getFullYear().toString()
    );
  return html;
};
