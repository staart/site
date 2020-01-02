import { getConfig } from "./config";

export const filePathtoUrl = async (path: string) => {
  const config = await getConfig();
  if (path.startsWith("@/")) path = path.replace("@/", "@");
  if (config.fancyLinks)
    return `${config.baseUrl || ""}/${path
      .replace("index.md", "")
      .replace(".md", "")}`;
  return path.replace(".md", ".html");
};
