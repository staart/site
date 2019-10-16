import marked, { Renderer } from "marked";
import frontMatter from "front-matter";
import { FrontMatter } from "./interfaces";

export const renderMd = (md: string, avoidParagraphs = false) => {
  const renderer = new Renderer();
  if (avoidParagraphs) renderer.paragraph = p => p;
  return marked.parse(frontMatter<FrontMatter>(md).body, {
    smartypants: true,
    renderer
  });
};

export const removeHeading = async (md: string) =>
  md
    .split("\n")
    .filter(line => !line.startsWith("# "))
    .join("\n");

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
