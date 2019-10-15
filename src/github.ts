import { getConfig } from "./config";

export const getGitHubRepoUrl = async () => {
  const config = await getConfig();
  if (config._gitRepo && config._gitRepo.source === "github.com")
    return `https://${config._gitRepo.source}${config._gitRepo.pathname}`;
};
