import marked from "marked";
import frontMatter from "front-matter";
import { FrontMatter } from "./interfaces";

export const parseMarkdown = async (md: string) => {
  return marked.parse(md);
};

export const getTitle = async (md: string) => {
  const data = marked.lexer(md);
  let title: string | undefined;
  data.forEach(item => {
    if (item.type === "heading" && item.depth === 1) title = item.text;
  });
  const attributes = frontMatter<FrontMatter>(md).attributes;
  if (attributes.title) title = attributes.title;
  if (title && attributes.emoji) title = `${attributes.emoji} ${title}`;
  return title;
};
