const { adminConfigRoutes } = require("./config");
const { adminPermissionRoutes } = require("./permission");
const { adminPlanRoutes } = require("./plan");
const { adminProfileRoutes } = require("./profile");
const { adminRoleRoutes } = require("./role");
const { adminUserRoutes } = require("./user");
const router = require("express").Router();

router.use("/plan", adminPlanRoutes);
router.use("/config", adminConfigRoutes);
router.use("/user", adminUserRoutes);
router.use("/permission", adminPermissionRoutes);
router.use("/role", adminRoleRoutes);
router.use("/profile", adminProfileRoutes);

module.exports = {
    AdminRoutes: router
}