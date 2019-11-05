import { readFile, readdir } from "fs-extra";
import { join, parse } from "path";
import { getConfig } from "./config";
import recursiveReadDir from "recursive-readdir";
import { cached } from "./cache";
import { FrontMatter } from "./interfaces";
import frontMatter from "front-matter";

export const getContentPath = async () => {
  const config = await getConfig();
  return config.contentDir
    ? join(".", config.contentDir)
    : join(".", "content");
};

export const getDistPath = async () => {
  const config = await getConfig();
  return config.distDir ? join(".", config.distDir) : join(".", "public");
};

export const getTemplatePath = async () => {
  const config = await getConfig();
  return config.templatePath
    ? join(".", config.templatePath)
    : join(await getContentPath(), "..", "index.html");
};

export const getStylePath = async () => {
  const config = await getConfig();
  return config.stylePath
    ? join(".", config.stylePath)
    : join(await getContentPath(), "..", "style.scss");
};

export const getScriptPath = async () => {
  const config = await getConfig();
  return config.scriptPath
    ? join(".", config.scriptPath)
    : join(__dirname, "..", "src", "staart.js");
};

export const getTemplatesDirPath = async () => {
  const config = await getConfig();
  return config.templatePartsDir
    ? join(".", config.templatePartsDir)
    : join(__dirname, "..", "src", "templates");
};

const safeReadFile = async (file: string) => {
  try {
    const contents = await readFile(file);
    if (contents) return contents.toString();
  } catch (error) {}
};

export const getHomePath = async () => {
  const config = await getConfig();
  const contentDir = await getContentPath();
  if (config.homePath) return config.homePath;
  let file: string | undefined = undefined;
  file = join(contentDir, "index.md");
  if (safeReadFile(file)) return file;
  file = join(contentDir, "README.md");
  if (safeReadFile(file)) return file;
  file = join(contentDir, "..", "README.md");
  if (safeReadFile(file)) return file;
  return join("..", "src", "index.md");
};

export const readContentFile = async (path: string) => {
  const result = await cached<string>(`file-${path}`, async () =>
    (await readFile(join(await getContentPath(), path))).toString()
  );
  if (result) return result;
  throw new Error(`Could not read file: ${path}`);
};

export const listRootFiles = async () => {
  const contentPath = await getContentPath();
  let files = (await readdir(contentPath)).map(file =>
    parse(file).ext ? file : `${file}/index.md`
  );
  const result = [];
  for await (const file of files) {
    const content =
      (await safeReadFile(join(await getContentPath(), file))) || "";
    if (content) {
      const attributes = frontMatter<FrontMatter>(content).attributes;
      if (content && !attributes.draft) result.push(file);
    }
  }
  return result;
};

export const listDirs = async () => {
  const contentPath = await getContentPath();
  return Array.from(
    new Set((await recursiveReadDir(contentPath)).map(f => parse(f).dir))
  )
    .filter(d => d !== contentPath)
    .map(d => d.replace(`${contentPath}/`, ""));
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
  let finalFiles: string[] = [];
  for await (const file of files) {
    const content = await safeReadFile(file);
    if (!content) return [];
    const attributes = frontMatter<FrontMatter>(content).attributes;
    if (!attributes.draft) {
      finalFiles.push(file);
    }
  }
  if (removeContentPath)
    finalFiles = finalFiles.map(file => file.replace(`${contentPath}/`, ""));
  return finalFiles;
};

export const getTemplatePart = async (name: string) => {
  const templatePart = await safeReadFile(
    join(await getTemplatesDirPath(), `${name}.html`)
  );
  if (templatePart) return templatePart;
  return await getDefaultTemplatePart(name);
};

export const getDefaultTemplatePart = async (name: string) => {
  return await safeReadFile(
    join(__dirname, "..", "src", "templates", `${name}.html`)
  );
};

export const getTemplatePartsList = async () => {
  return await cached<string[]>("template-parts", async () => {
    const templatePartsDir = await getTemplatesDirPath();
    const defaultTemplatesPartDir = join(__dirname, "..", "src", "templates");
    const templatePartsFiles = await readdir(templatePartsDir);
    const defaultTemplateFiles = await readdir(defaultTemplatesPartDir);
    return Array.from(
      new Set([...templatePartsFiles, ...defaultTemplateFiles])
    ).map(i => i.replace(".html", ""));
  });
};
