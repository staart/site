import childProcess from "child_process";

export const buildEleventy = (
  flags: string[] = [],
  env: string = process.env.NODE_ENV ?? "development"
) => {
  childProcess.execSync(
    `npx cross-env ELEVENTY_ENV=${env} npx @11ty/eleventy --config=.staart/.eleventy.js ${flags.join(
      " "
    )}`,
    {
      stdio: "inherit",
    }
  );
};
