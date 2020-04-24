import { init, watcher } from "./init";
import { buildEleventy } from "./build";
const liveServer = require("live-server");

/**
 * Build production site
 * @param params - CLI parameters and flags
 */
export const build = async (...params: string[]) => {
  await init();
  buildEleventy(params, "production");
};

/**
 * Watch site changes
 * @param params - CLI parameters and flags
 */
export const watch = async (...params: string[]) => {
  await init();
  watcher(() => buildEleventy(params, "development"));
  buildEleventy(params, "development");
};

/**
 * Serve site on a local server
 * @param params - CLI parameters and flags
 */
export const serve = async (...params: string[]) => {
  await init();
  watcher(() => buildEleventy(params, "development"));
  buildEleventy(params, "development");
  liveServer.start({
    root: "dist",
    open: true,
    logLevel: 0,
  });
};
