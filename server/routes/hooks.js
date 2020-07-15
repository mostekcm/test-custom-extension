const { Router: router } = require("express");
const { middlewares } = require("auth0-extension-express-tools");

const config = require("../lib/config");
const logger = require("../lib/logger");
const metadata = require("../../webtask.json");

module.exports = () => {
  const hookValidator = middlewares.validateHookToken(
    config("AUTH0_DOMAIN"),
    config("WT_URL"),
    config("EXTENSION_SECRET")
  );

  const hooks = router();
  hooks.use(
    middlewares.managementApiClient({
      domain: config("AUTH0_DOMAIN"),
      clientId: config("AUTH0_CLIENT_ID"),
      clientSecret: config("AUTH0_CLIENT_SECRET")
    })
  );

  hooks.use("/on-uninstall", hookValidator("/.extensions/on-uninstall"));
  hooks.delete("/on-uninstall", async (req, res) => {
    logger.debug(`Uninstall running version ${metadata.version} ...`);
    res.sendStatus(204);
  });

  hooks.use("/on-install", hookValidator("/.extensions/on-install"));
  hooks.post("/on-install", async (req, res) => {
    logger.verbose(`Install running version ${metadata.version} ...`);
    return res.sendStatus(204);
  });

  hooks.use("/on-update", hookValidator("/.extensions/on-update"));
  hooks.put("/on-update", async (req, res) => {
    logger.verbose(`Update running version ${metadata.version} ...`);
    res.sendStatus(204);
  });

  return hooks;
};
