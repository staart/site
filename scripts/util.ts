import { lstat, readFile } from "fs-extra";
import { join } from "path";

/**
 * Replace a value if string starts with it
 * @param str - String te replace in
 * @param searchValue - Value to find for replacement
 * @param replaceValue - Value to replace with
 */
export const replaceStart = (
  str: string,
  searchValue: string,
  replaceValue: string
) =>
  str.startsWith(searchValue) ? str.replace(searchValue, replaceValue) : str;

/**
 * Replace a value if string ends with it
 * @param str - String te replace in
 * @param searchValue - Value to find for replacement
 * @param replaceValue - Value to replace with
 */
export const replaceEnd = (
  str: string,
  searchValue: string,
  replaceValue: string
) => (str.endsWith(searchValue) ? str.replace(searchValue, replaceValue) : str);

/**
 * Get the title of a markdown content file
 * @param file - File name
 */
export const getTitleFromFile = async (file: string): Promise<string> => {
  const fileContents = await readFile(join(".", file), "utf8");
  if (fileContents.includes("title:"))
    return fileContents.split("title:")[1].split("\n")[0].trim();
  return "";
};
