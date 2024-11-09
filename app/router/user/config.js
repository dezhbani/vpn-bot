const { UserConfigController } = require("../../controllers/user/config.controller");

const router = require("express").Router();

router.post("/buy", UserConfigController.buyConfig);
router.post("/repurchase", UserConfigController.repurchaseConfig);
router.get("/list", UserConfigController.getConfigs);
router.get("/all", UserConfigController.getAllConfigs);
router.get("/details/:configID", UserConfigController.getConfigDetailsByID);
router.get("/:configID", UserConfigController.getConfigByID);

module.exports = {
    userConfigRoutes: router
}