export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(() => resolve(), ms));

export const ucEach = (words: string) =>
  words
    .toLowerCase()
    .split(" ")
    .map(s => s.charAt(0).toUpperCase() + s.substring(1))
    .join(" ");

export const unslugify = (slug: string) => ucEach(slug.split("-").join(" "));
