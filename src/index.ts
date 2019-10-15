import { success, error } from "signale";
import { getConfig } from "./config";

const staartSite = async () => {
  const config = await getConfig();
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
