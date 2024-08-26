const { verifyToken } = require("../middlewares/verifyAccessToken");
const { AdminRoutes } = require("./admin/admin.routes");
const { adminPaymentsRoutes } = require("./admin/payments");
const { adminProfileRoutes } = require("./public/profile");
const { userAuthRoutes } = require("./user/auth/auth");
const { UserRoutes } = require("./user/user.routes");

const router = require("express").Router(); 

router.use("/auth", userAuthRoutes);
router.use("/profile", verifyToken, adminProfileRoutes);
router.use("/payment", adminPaymentsRoutes);
router.use("/admin", verifyToken, AdminRoutes);
router.use("/user", verifyToken, UserRoutes);

module.exports = {
    AllRoutes: router
}