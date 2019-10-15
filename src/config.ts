import cosmiconfig from "cosmiconfig";
import { StaartSiteConfig } from "./interfaces";
const explorer = cosmiconfig("staart");

export const getConfig = async () => {
  const searchResult = await explorer.search();
  const config: StaartSiteConfig = searchResult ? searchResult.config : {};
  return config;
};
