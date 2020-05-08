import { pathExists, readJson, writeFile, writeJson } from "fs-extra";
import { join } from "path";
import childProcess from "child_process";

export const revert = async () => {
  if (await pathExists(join(".", "package.json"))) {
    const currentPackage: any = await readJson(join(".", "package.json"));
    if (currentPackage._staartrc) {
      delete currentPackage["@staart/site"];
      delete currentPackage._staartrc;
      await writeFile(
        join(".", "package.json"),
        JSON.stringify(currentPackage, null, 2) + "\n"
      );
    }
  }
};

export const createPackageJson = async () => {
  if (!(await pathExists(join(".", "package.json")))) {
    await writeJson(join(".", "package.json"), {});
  }
  childProcess.execSync("cd .staart && npm i @staart/site@3.0.0-beta.14", {
    stdio: "inherit",
  });
  let config = (await readJson(join(".", "package.json")))["@staart/site"];
  if (!config) {
    if (await pathExists(join(".", ".staartrc"))) {
      config = await readJson(join(".", ".staartrc"));
    }
    const currentPackage: any = await readJson(join(".", "package.json"));
    currentPackage["@staart/site"] = { ...config };
    currentPackage._staartrc = true;
    await writeFile(
      join(".", "package.json"),
      JSON.stringify(currentPackage, null, 2)
    );
  }
  return config;
};
