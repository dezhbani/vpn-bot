const { adminConfigRoutes } = require("./config");
const { adminPlanRoutes } = require("./plan");
const router = require("express").Router();

router.use("/plan", adminPlanRoutes);
router.use("/config", adminConfigRoutes);

module.exports = {
    AdminRoutes: router
}