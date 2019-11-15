import { GitUrl } from "git-url-parse";

export interface StaartSiteConfig {
  title?: string;
  repo?: string;
  _gitRepo?: GitUrl;
  contentDir?: string;
  distDir?: string;
  assetsDir?: string;
  templatePartsDir?: string;
  templatePath?: string;
  stylePath?: string;
  scriptPath?: string;
  homePath?: string;
  redirectsPath?: string;
  hostname?: string;
  navbar?: string[];
  footerNavbar?: string[];
  contentFileExt?: string[];
  keepHomeHeading?: boolean;
  ignoreReplaceTitle?: boolean;
  ignoreReplaceDescription?: boolean;
  ignoreReplaceAuthor?: boolean;
  ignoreReplaceYear?: boolean;
  noHome?: boolean;
  noSitemap?: boolean;
  noContentList?: boolean;
  noDelayWithoutToken?: boolean;
  themeColor?: string;
  textColor?: string;
  linkColor?: string;
  lightColor?: string;
  noLastModified?: boolean;
  noGenerator?: boolean;
  noSyntaxHighlighting?: boolean;
  noShieldSchema?: boolean;
  noBreadcrumbd?: boolean;
  noFontCdn?: boolean;
  shieldSchemaLabel?: string;
  shieldSchemaColor?: string;
  [index: string]: any;
}

export interface FrontMatter {
  title: string;
  emoji: string;
  seoImage: string;
  description: string;
  draft: boolean;
  [index: string]: string | boolean;
}
