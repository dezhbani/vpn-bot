const { adminConfigRoutes } = require("./config");
const { adminPermissionRoutes } = require("./permission");
const { adminPlanRoutes } = require("./plan");
const { adminReportRoutes } = require("./reports");
const { adminRoleRoutes } = require("./role");
const { adminSupportRoutes } = require("./ticket");
const { adminUserRoutes } = require("./user");
const router = require("express").Router();

router.use("/plan", adminPlanRoutes);
router.use("/config", adminConfigRoutes);
router.use("/user", adminUserRoutes);
router.use("/permission", adminPermissionRoutes);
router.use("/role", adminRoleRoutes);
router.use("/report", adminReportRoutes);
// router.use("/support", adminSupportRoutes);

module.exports = {
    AdminRoutes: router
}