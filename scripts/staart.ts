import { join } from "path";
import {} from "fs-extra";
import {} from "typescript";

const staart = async () => {
  await mkdir(join(".", ".staart"), { recursive: true });
  await copyFile(
    join(".", ".eleventy.ts"),
    join(".", ".staart", ".eleventy.ts")
  );
};

staart();
