import { getConfig } from "./config";
import axios from "axios";
import { getContentPath } from "./files";

export const getGitHubRepoUrl = async () => {
  const config = await getConfig();
  if (config._gitRepo && config._gitRepo.source === "github.com")
    return `https://${config._gitRepo.source}${config._gitRepo.pathname}`;
};

export const getLastCommit = async (
  file: string
): Promise<
  | {
      html_url: string;
      sha: string;
      author: {
        login: string;
        name: string;
        avatar_url: string;
        html_url: string;
      };
      commit: {
        message: string;
        author: {
          name: string;
          email: string;
          date: string;
        };
      };
    }
  | undefined
> => {
  try {
    const config = await getConfig();
    if (config._gitRepo && config._gitRepo.source === "github.com")
      return (await axios.get(
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
      )).data[0];
  } catch (error) {}
};
