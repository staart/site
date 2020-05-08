import pluginRss from "@11ty/eleventy-plugin-rss";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import safeLinks from "eleventy-plugin-safe-external-links";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { config } from "dotenv";
config();

import filters from "./eleventy/filters";
import shortcodes from "./eleventy/shortcodes";
import transforms from "./eleventy/transforms";

import pkg from "./package.json";
const settings: any = (pkg as any)["@staart/site"] || {};

module.exports = (config: any) => {
  config.setUseGitIgnore(false);

  config.addPlugin(pluginRss);
  config.addPlugin(syntaxHighlight);
  config.addPlugin(safeLinks);

  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName]);
  });
  Object.keys(shortcodes).forEach((shortcodeName) => {
    config.addAsyncShortcode(shortcodeName, shortcodes[shortcodeName]);
  });

  Object.keys(transforms).forEach((transformName) => {
    config.addTransform(transformName, transforms[transformName]);
  });

  const mdlib = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  }).use(markdownItAnchor, {
    permalink: true,
    permalinkClass: "anchor",
    permalinkSymbol: "#",
  });
  config.setLibrary("md", mdlib);

  config.addLayoutAlias("base", "base.njk");
  config.addLayoutAlias("post", "post.njk");

  config.addPassthroughCopy({ ".staart/static": "./" });
  config.setDataDeepMerge(true);

  return {
    dir: {
      input: ".staart/src",
      output: "dist",
      includes: "includes",
      layouts: "layouts",
    },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    passthroughFileCopy: true,
    pathPrefix: settings.baseUrl,
  };
};
