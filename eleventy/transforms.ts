const htmlnano = require("htmlnano");

const preset = { ...htmlnano.presets.safe, removeRedundantAttributes: true };

export default {
  htmlmin: async function(content: string, outputPath: string) {
    if (
      outputPath &&
      outputPath.endsWith(".html") &&
      process.env.ELEVENTY_ENV === "production"
    ) {
      const { html } = await htmlnano.process(
        content,
        {
          removeUnusedCss: {
            tool: "purgeCSS",
          },
          minifySvg: {
            plugins: [{ removeViewBox: false }],
          },
        },
        preset
      );
      return html;
    }
    return content;
  },
};
