const { userConfigRoutes } = require("./config");
const { userPlanRoutes } = require("./plan");
const { userProfileRoutes } = require("./profile");

const router = require("express").Router();

router.use("/profile", userProfileRoutes);
router.use("/config", userConfigRoutes);
router.use("/plan", userPlanRoutes);

module.exports = {
    UserRoutes: router
}