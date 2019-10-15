import Fraud from "fraud";
import { ensureDir } from "fs-extra";
const cache = new Fraud({
  directory: ".cache/staart-site"
});

export const cached = async (name: string, f: Function) => {
  await ensureDir(".cache/staart-site");
  try {
    return await cache.read(`func-${name}`);
  } catch (error) {
    const result = await f();
    cache.create(`func-${name}`, result);
    return result;
  }
};
