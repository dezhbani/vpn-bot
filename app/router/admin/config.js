const { configController } = require("../../controllers/admin/config.controller");

const router = require("express").Router();

router.get("/", configController.getAll);
router.get("/active/:userID", configController.getUserActiveConfigs);
router.post("/endedTime", configController.getBYEndedTime);
router.post("/changeStatus", configController.changeStatus);
router.post("/add", configController.buyConfig);
router.delete("/delete", configController.deleteConfig);
router.post("/repurchase", configController.repurchase)
router.post("/replace", configController.replaceAllConfigs)

module.exports = {
    adminConfigRoutes: router
}