import frontMatter from "front-matter";
import marked from "marked";
import truncate from "truncate";
import { listContentFiles, readContentFile } from "./files";
import { FrontMatter } from "./interfaces";
import { getTitle, removeHeading } from "./parse";
import { getConfig } from "./config";
import { cached } from "./cache";
import { parse } from "path";
import icons from "./icons";

const INIT_ZEROS = "00000000";

interface IFile {
  file: string;
  htmlPath: string;
  body: string;
  content: string;
  excerpt: string;
  title: string;
  titleWithEmoji: string;
  attributes: FrontMatter;
  fullTitle: string;
  breadcrumbs: string[];
  prev?: string;
  next?: string;
}

const getExcerpt = (content: string) => {
  const data = marked.lexer(content);
  let excerpt = "";
  data.forEach(item => {
    if (!excerpt && item.type === "paragraph") excerpt = item.text;
  });
  return truncate(excerpt, 1000);
};

const getBreadcrumbsList = async (file: string) => {
  const crumbs = ["index.md"];
  const parts = file.split("/");
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === "index.md") continue;
    let link = `${parts.slice(0, i + 1).join("/")}`;
    if (!link.endsWith(".md")) link = `${link}/index.md`;
    crumbs.push(link);
  }
  const breadcrumbs: string[] = [];
  for await (const crumb of crumbs) {
    try {
      if (crumb === "index.md") continue;
      const content = await readContentFile(crumb);
      breadcrumbs.push(crumb);
    } catch (error) {}
  }
  return breadcrumbs;
};

const getFileInfo = async (file: string): Promise<IFile> => {
  // return await cached<IFile>(`file-${file}`, async () => {
  const config = await getConfig();
  const siteTitle = config.title || "Staart Site";
  const siteTitleSeparator = config.titleSeparator || "|";
  const text = await readContentFile(file);
  const markdown = frontMatter<FrontMatter>(text);
  const attributes: FrontMatter = markdown.attributes || {};
  attributes.tags = attributes.tags || [];
  const excerpt = getExcerpt(markdown.body);
  const title = (await getTitle(markdown.body)) || "";
  const titleWithEmoji = (await getTitle(markdown.body, true)) || "";
  const fullTitle = title
    ? `${title} ${siteTitleSeparator} ${siteTitle}`
    : siteTitle;
  const breadcrumbs = await getBreadcrumbsList(file);
  const htmlPath = file.replace(".md", ".html");
  return {
    file,
    htmlPath,
    attributes,
    body: markdown.body,
    content: text,
    excerpt,
    title,
    titleWithEmoji,
    fullTitle,
    breadcrumbs
  };
  // });
};

export const getSiteContent = async () => {
  return cached<IFile[]>("all-content", async () => {
    const content: IFile[] = [];
    const files = (await listContentFiles()).filter(
      file => !parse(file).dir.startsWith("tags/")
    );
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const parts = file.split("/");
      if (parts[parts.length - 1] === "index.md")
        parts[parts.length - 1] = `${INIT_ZEROS}${parts[parts.length - 1]}`;
      files[i] = parts.join("/");
    }
    const sorted = files
      .sort((a, b) => a.localeCompare(b))
      .map(file => file.replace(INIT_ZEROS, ""));
    for await (const file of sorted) content.push(await getFileInfo(file));
    for (let k = 0; k < content.length; k++)
      if (k !== 0) content[k].prev = { ...content[k - 1] }.file;
    for (let j = 0; j < content.length; j++)
      if (j < content.length - 1) content[j].next = { ...content[j + 1] }.file;
    return content;
  });
};

const linkify = (attributes: { [index: string]: string }, key: string) =>
  attributes[key]
    ? `<a href="https://${key}.com/${
        attributes[key]
      }" aria-label="${key}" class="no-external">
      ${(icons as { [index: string]: string })[key]}
    </a>\n`
    : "";

export const getAboutAuthor = async (author?: string, onlyLinks = false) => {
  if (!author) return "";
  const aboutAuthor = await cached<{
    name: string;
    about: string;
    attributes: {
      facebook: string;
    };
  }>(`author-${author}`, async () => {
    try {
      const content = await readContentFile(`@/${author}.md`);
      const name = (await getTitle(content)) || "";
      const fm = frontMatter(content);
      const about = getExcerpt(await removeHeading(fm.body));
      const attributes = fm.attributes;
      return { name, about, attributes };
    } catch (error) {}
  });
  if (!aboutAuthor) return "";
  if (onlyLinks)
    return `<nav class="byline-social">${Object.keys(icons)
      .map(i => linkify(aboutAuthor.attributes, i))
      .join("")}</nav>`;
  return `<div class="byline">
  <img alt="" src="https://unavatar.now.sh/twitter/kikobeats">
  <address class="author"><a rel="author" href="/@${author}.html">${
    aboutAuthor.name
  }</a></address>
  <p>${aboutAuthor.about}</p>
  <nav class="byline-social">${Object.keys(icons)
    .map(i => linkify(aboutAuthor.attributes, i))
    .join("")}</nav>
</div>`;
};
