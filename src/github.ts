import { getConfig } from "./config";
import axios from "axios";
import { getContentPath } from "./files";
import { sleep } from "./util";

export const getGitHubRepoUrl = async () => {
  const config = await getConfig();
  if (config._gitRepo && config._gitRepo.source === "github.com")
    return `https://${config._gitRepo.source}${config._gitRepo.pathname}`;
};

interface Commit {
  html_url: string;
  sha: string;
  author?: {
    login: string;
    name: string;
    avatar_url: string;
    html_url: string;
  };
  commit?: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  firstCommit: Commit;
}
export const getLastCommit = async (
  file: string
): Promise<Commit | undefined> => {
  try {
    const config = await getConfig();
    if (!config.noDelayWithoutToken) await sleep(1000);
    if (config._gitRepo && config._gitRepo.source === "github.com") {
      const data = (
        await axios.get(
          `https://api.github.com/repos/${
            config._gitRepo.full_name
          }/commits?path=${await getContentPath()}/${file.replace(
            ".html",
            ".md"
          )}`,
          {
            headers: {
              "User-Agent": "Staart Site <github.com/staart/site>",
              ...(process.env.GITHUB_TOKEN
                ? {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`
                  }
                : {})
            }
          }
        )
      ).data;
      if (data.length)
        return { ...data[0], firstCommit: data[data.length - 1] };
    }
  } catch (error) {}
};
