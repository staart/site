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
