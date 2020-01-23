import { getConfig } from "./config";
import { render as scss } from "sass";

export const filePathtoUrl = async (path: string) => {
  const config = await getConfig();
  if (path.startsWith("@/")) path = path.replace("@/", "@");
  if (config.fancyLinks)
    return `${config.baseUrl || ""}/${path
      .replace("index.md", "")
      .replace(".md", "")}`;
  return "/" + path.replace(".md", ".html");
};

export const renderScss = (styles: string) =>
  new Promise((resolve, reject) => {
    scss({ data: styles }, (error, result) => {
      if (error) return reject(error);
      resolve(result.css.toString());
    });
  });
