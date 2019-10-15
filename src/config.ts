import cosmiconfig from "cosmiconfig";
import { StaartSiteConfig } from "./interfaces";
import { join } from "path";
import { readJSON } from "fs-extra";
import gitUrlParse from "git-url-parse";
import { cached } from "./cache";
const explorer = cosmiconfig("staart");

export const getConfig = async (): Promise<StaartSiteConfig> => {
  return cached("config", _getConfig);
};

const _getConfig = async () => {
  const searchResult = await explorer.search();
  const config: StaartSiteConfig = searchResult ? searchResult.config : {};
  let gitRepoUrl = config.repo;
  if (searchResult && searchResult.filepath) {
    const packagePath = join(searchResult.filepath, "..", "package.json");
    try {
      const pkg = await readJSON(packagePath);
      gitRepoUrl = gitRepoUrl || pkg.repository;
    } catch (error) {}
  }
  if (gitRepoUrl) {
    config._gitRepo = gitUrlParse(gitRepoUrl);
  }
  return config;
};
