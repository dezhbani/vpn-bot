const { adminConfigRoutes } = require("./config");
const { adminPlanRoutes } = require("./plan");
const { adminUserRoutes } = require("./user");
const router = require("express").Router();

router.use("/plan", adminPlanRoutes);
router.use("/config", adminConfigRoutes);
router.use("/user", adminUserRoutes);

module.exports = {
    AdminRoutes: router
}