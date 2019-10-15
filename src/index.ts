import { success, error } from "signale";
import { getGitHubRepoUrl } from "./github";

const staartSite = async () => {
  console.log("GitHub URL", await getGitHubRepoUrl());
};

const startTime = new Date().getTime();
staartSite()
  .then(() =>
    success(
      `Start Site built in ${(
        (new Date().getTime() - startTime) /
        1000
      ).toFixed(2)}s`
    )
  )
  .catch(err => error(err));
