import NodeCache from "node-cache";
const cache = new NodeCache();

export const cached = async <T>(name: string, f: Function) => {
  name = name.replace(/[^a-zA-Z ]/g, "");
  let result = cache.get<T>(`func-${name}`);
  if (result) return result;
  result = (await f()) as T;
  cache.set(`func-${name}`, result);
  return result;
};
