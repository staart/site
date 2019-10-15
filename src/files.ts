import { readFile } from "fs-extra";
import { join, parse } from "path";
import { getConfig } from "./config";
import recursiveReadDir from "recursive-readdir";
import { cached } from "./cache";

export const getContentPath = async () => {
  const config = await getConfig();
  return config.contentDir
    ? join(__dirname, "..", config.contentDir)
    : join(__dirname, "..", "content");
};

export const getDistPath = async () => {
  const config = await getConfig();
  return config.distDir
    ? join(__dirname, "..", config.distDir)
    : join(__dirname, "..", "public");
};

export const getTemplatePath = async () => {
  const config = await getConfig();
  return config.templatePath
    ? join(__dirname, "..", config.templatePath)
    : join(await getContentPath(), "..", "index.html");
};

export const getStylePath = async () => {
  const config = await getConfig();
  return config.stylePath
    ? join(__dirname, "..", config.stylePath)
    : join(await getContentPath(), "..", "style.scss");
};

export const readContentFile = async (path: string) => {
  return await cached(`file-${path}`, async () =>
    readFile(join(await getContentPath(), path))
  );
};

export const listContentFiles = async (
  dir?: string,
  filterContentFiles = true,
  removeContentPath = true
) => {
  const contentPath = dir
    ? join(await getContentPath(), dir)
    : await getContentPath();
  let files = await recursiveReadDir(contentPath);
  const config = await getConfig();
  if (filterContentFiles)
    files = files.filter(name =>
      (config.contentFileExt || ["md"])
        .map(ext => `.${ext}`)
        .includes(parse(name).ext)
    );
  if (removeContentPath)
    files = files.map(file => file.replace(`${contentPath}/`, ""));
  return files;
};
