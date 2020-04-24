import pluginRss from "@11ty/eleventy-plugin-rss";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import safeLinks from "eleventy-plugin-safe-external-links";
import { config } from "dotenv";
config();

import filters from "./eleventy/filters";
import transforms from "./eleventy/transforms";

module.exports = function(config: any) {
  config.setUseGitIgnore(false);

  config.addPlugin(pluginRss);
  config.addPlugin(safeLinks);

  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName]);
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

  config.addPassthroughCopy("admin");
  config.addPassthroughCopy("src/email");
  config.addPassthroughCopy("src/static");
  config.addPassthroughCopy("src/CNAME");
  config.addPassthroughCopy("src/robots.txt");

  config.setDataDeepMerge(true);

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "includes",
      layouts: "layouts",
      data: "data",
    },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    passthroughFileCopy: true,
  };
};
