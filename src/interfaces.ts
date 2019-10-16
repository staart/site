import { GitUrl } from "git-url-parse";

export interface StaartSiteConfig {
  title?: string;
  repo?: string;
  _gitRepo?: GitUrl;
  contentDir?: string;
  distDir?: string;
  templatePath?: string;
  stylePath?: string;
  homePath?: string;
  contentFileExt?: string[];
  keepHomeHeading?: boolean;
  ignoreReplaceTitle?: boolean;
  ignoreReplaceDescription?: boolean;
  ignoreReplaceAuthor?: boolean;
  ignoreReplaceYear?: boolean;
  [index: string]: any;
}

export interface FrontMatter {
  title?: string;
  emoji?: string;
  seoImage?: string;
}
