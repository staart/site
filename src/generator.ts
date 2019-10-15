import { ensureDir } from "fs-extra";
import { getDistPath } from "./files";

export const generate = async () => {
  ensureDir(await getDistPath());
};
