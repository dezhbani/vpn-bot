const { configController } = require("../../controllers/admin/config.controller");
const { checkPermission } = require("../../middlewares/permission.guard");

const router = require("express").Router();

router.get("/", checkPermission("configs-list"), configController.getAll);
router.get("/active/:userID", checkPermission("user-active-config"), configController.getUserActiveConfigs);
router.post("/endedTime", checkPermission("search-end-time"), configController.getBYEndedTime);
router.post("/changeStatus", checkPermission("change-status"), configController.changeStatus);
router.post("/add", checkPermission("add-config"), configController.buyConfig);
router.post("/upgrade", checkPermission("upgrade-config"), configController.upgradeConfig);
router.delete("/delete", checkPermission("delete-config"), configController.deleteConfig);
router.post("/repurchase", checkPermission("repurchase-config"), configController.repurchase)
// router.post("/replace", checkPermission(""), configController.replaceAllConfigs)

module.exports = {
    adminConfigRoutes: router
}