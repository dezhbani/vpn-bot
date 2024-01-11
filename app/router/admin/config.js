const { configController } = require("../../controllers/admin/config.controller");

const router = require("express").Router();

router.post("/add", configController.buyConfig);
router.delete("/delete", configController.deleteConfig);
router.post("/repurchase/:userID", configController.repurchase);
router.get("/", configController.getAllConfigs);

module.exports = {
    adminConfigRoutes: router
}