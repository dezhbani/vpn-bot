const { UserConfigController } = require("../../controllers/user/config.controller");

const router = require("express").Router();

router.get("/list", UserConfigController.getConfigs);
router.get("/all", UserConfigController.getAllConfigs);
router.get("/details/:configID", UserConfigController.getConfigDetailsByID);

module.exports = {
    userConfigRoutes: router
}