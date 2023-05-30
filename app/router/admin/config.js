const { configController } = require("../../controllers/admin/config.controller");

const router = require("express").Router();

router.post("/add", configController.addConfig);
router.delete("/delete", configController.deleteConfig);
// router.patch("/edit/:id", planController.editPlan);
router.get("/", configController.getAllConfigs);

module.exports = {
    adminConfigRoutes: router
}