import { init } from "./init";

/**
 * Build production site
 * @param params - CLI parameters and flags
 */
export const build = async (...params: string[]) => {
  await init();
};

/**
 * Watch site changes
 * @param params - CLI parameters and flags
 */
export const watch = async (...params: string[]) => {
  await init();
};

/**
 * Serve site on a local server
 * @param params - CLI parameters and flags
 */
export const serve = async (...params: string[]) => {
  await init();
};

/**
 * Run site in debug mode
 * @param params - CLI parameters and flags
 */
export const debug = async (...params: string[]) => {
  await init();
};
