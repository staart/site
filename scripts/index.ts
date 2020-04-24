import { init } from "./init";
import { buildEleventy } from "./build";

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
  buildEleventy(["--watch", ...params], "development");
};

/**
 * Serve site on a local server
 * @param params - CLI parameters and flags
 */
export const serve = async (...params: string[]) => {
  await init();
  buildEleventy(["--serve", ...params], "development");
};
