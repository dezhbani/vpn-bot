const { configController } = require("../../controllers/admin/config.controller");

const router = require("express").Router();

router.get("/", configController.getAll);
router.post("/changeStatus", configController.changeStatus);
router.post("/add", configController.buyConfig);
router.delete("/delete", configController.deleteConfig);
router.post("/repurchase/:userID", configController.repurchase)

module.exports = {
    adminConfigRoutes: router
}