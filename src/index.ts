import cosmiconfig from "cosmiconfig";
import { success, error } from "signale";
import { StaartSiteConfig } from "./interfaces";

const explorer = cosmiconfig("staart");

const staartSite = async () => {
  const searchResult = await explorer.search();
  const config: StaartSiteConfig = searchResult ? searchResult.config : {};
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
