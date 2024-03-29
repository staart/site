import marked, { Renderer } from "marked";
import frontMatter from "front-matter";
import { FrontMatter } from "./interfaces";
import { listContentFiles, readContentFile } from "./files";
import { getConfig } from "./config";
import hljs from "highlight.js";

export const renderMd = (md: string, avoidParagraphs = false) => {
  const renderer = new Renderer();
  if (avoidParagraphs) renderer.paragraph = p => p;
  return marked.parse(frontMatter<FrontMatter>(md).body, {
    smartypants: true,
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (error) {
          return str;
        }
      }
      return str;
    },
    renderer
  });
};

export const removeHeading = async (md: string) =>
  md
    .split("\n")
    .filter(line => !line.startsWith("# "))
    .join("\n");

export const getTitle = async (md: string, keepEmoji = true) => {
  const data = marked.lexer(md);
  let title: string | undefined;
  data.forEach(item => {
    if (item.type === "heading" && item.depth === 1) title = item.text;
  });
  const attributes = frontMatter<FrontMatter>(md).attributes;
  if (attributes.title) title = attributes.title;
  if (title && attributes.emoji && keepEmoji)
    title = `<span aria-hidden="true">${attributes.emoji}</span> ${title}`;
  return title;
};

export const getTags = async () => {
  const config = await getConfig();
  const tagsSlug = config.tagsName || "tags";
  const allTags: {
    [index: string]: Set<string>;
  } = {};
  const files = await listContentFiles();
  for await (const file of files) {
    const attributes = frontMatter(await readContentFile(file)).attributes as {
      tags?: (
        | string
        | {
            [index: string]: string;
          }
      )[];
    };
    if (attributes.tags)
      attributes.tags.forEach(tag => {
        if (typeof tag === "object") {
          Object.keys(tag).forEach(key => {
            allTags[key] = allTags[key] || new Set();
            allTags[key].add(tag[key]);
          });
        } else {
          allTags[tagsSlug] = allTags[tagsSlug] || new Set();
          allTags[tagsSlug].add(tag);
        }
      });
  }
  const finalTags: {
    [index: string]: string[];
  } = {};
  Object.keys(allTags).forEach(key => {
    finalTags[key] = Array.from(allTags[key]);
  });
  return finalTags;
};

export const getFilesForTag = async (key: string, value: string) => {
  const files = await listContentFiles();
  const config = await getConfig();
  const tagsSlug = config.tagsName || "tags";
  const result: Set<string> = new Set();
  for await (const file of files) {
    let has = false;
    const attributes = frontMatter(await readContentFile(file)).attributes as {
      tags?: (
        | string
        | {
            [index: string]: string;
          }
      )[];
    };
    if (attributes.tags)
      attributes.tags.forEach(tag => {
        if (typeof tag === "object") {
          Object.keys(tag).forEach(k => {
            if (k === key && tag[k] === value) has = true;
          });
        } else {
          if (key === tagsSlug && value === tag) has = true;
        }
      });
    if (has) result.add(file);
  }
  return Array.from(result);
};
