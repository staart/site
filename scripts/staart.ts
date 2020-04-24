import _fs from "fs";
const { copyFile, mkdir, unlink } = _fs.promises;
import { join } from "path";

const staart = async () => {
  await mkdir(join(".", ".staart"), { recursive: true });
  await copyFile(
    join(".", ".eleventy.ts"),
    join(".", ".staart", ".eleventy.ts")
  );
};

staart();
