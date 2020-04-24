const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const safeLinks = require("eleventy-plugin-safe-external-links");

const filters = require("./eleventy/filters.js");
const transforms = require("./eleventy/transforms.js");

require("dotenv").config();

module.exports = function(config) {
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
