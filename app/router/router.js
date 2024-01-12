const { checkPermission } = require("../middlewares/permission.guard");
const { verifyToken } = require("../middlewares/verifyAccessToken");
const { AdminRoutes } = require("./admin/admin.routes");
const { adminPaymentsRoutes } = require("./admin/payments");
const { adminProfileRoutes } = require("./admin/profile");
const { userAuthRoutes } = require("./user/auth");

const router = require("express").Router(); 

router.use("/auth", userAuthRoutes);
router.use("/profile", verifyToken, adminProfileRoutes);
router.use("/payment", adminPaymentsRoutes);
router.use("/admin", verifyToken, AdminRoutes);

module.exports = {
    AllRoutes: router
}