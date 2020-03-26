import { cosmiconfig } from "cosmiconfig";
import { StaartSiteConfig } from "./interfaces";
import { join } from "path";
import { readJSON } from "fs-extra";
import gitUrlParse from "git-url-parse";
import { cached } from "./cache";
const explorer = cosmiconfig("staart");

let customConfig: StaartSiteConfig | undefined = undefined;
export const getConfig = async (userConfig?: StaartSiteConfig) => {
  if (userConfig) customConfig = userConfig;
  const config = await cached<StaartSiteConfig>("config", _getConfig);
  if (config) return { ...config, ...customConfig } as StaartSiteConfig;
  throw new Error("Config not found");
};

export const readPackage = async (): Promise<
  { [key: string]: any } | undefined
> => {
  const searchResult = await explorer.search();
  if (!searchResult) return;
  const packagePath = join(searchResult.filepath, "..", "package.json");
  try {
    return await readJSON(packagePath);
  } catch (error) {}
};

const _getConfig = async () => {
  const searchResult = await explorer.search();
  const config: StaartSiteConfig = searchResult ? searchResult.config : {};
  let gitRepoUrl = config.repo;
  let staartVersion: string | undefined = undefined;
  const packagePath = join(".", "package.json");
  try {
    const pkg = await readJSON(packagePath);
    gitRepoUrl = gitRepoUrl || pkg.repository;
    staartVersion = pkg.dependencies["@staart/site"];
  } catch (error) {}
  config.staartVersion = staartVersion;
  if (gitRepoUrl) config._gitRepo = gitUrlParse(gitRepoUrl);
  return config;
};
