import { GitUrl } from "git-url-parse";

export interface StaartSiteConfig {
  title?: string;
  repo?: string;
  _gitRepo?: GitUrl;
  contentDir?: string;
  contentFileExt?: string[];
}

export interface FrontMatter {
  title?: string;
  emoji?: string;
  seoImage?: string;
}
