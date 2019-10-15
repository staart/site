import { success, error } from "signale";
import { getGitHubRepoUrl } from "./github";
import { listContentFiles } from "./files";

const staartSite = async () => {
  console.log("GitHub URL", await getGitHubRepoUrl());
  console.log("Content files", await listContentFiles());
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
