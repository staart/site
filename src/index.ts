import { success, error } from "signale";
import { getConfig } from "./config";
import { cached } from "./cache";

const staartSite = async () => {
  const config = await getConfig();
  const anand = await cached("anand", async () => {
    return "anand";
  });
  console.log("Anand is", anand);
};

const startTime = new Date().getTime();
staartSite()
  .then(() =>
    success(
      `Start Site built in ${(
        (new Date().getTime() - startTime) /
        1000
      ).toFixed(2)}s`
    )
  )
  .catch(err => error(err));
