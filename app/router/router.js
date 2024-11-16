const { UserConfigController } = require("../controllers/user/config.controller");
const { verifyToken } = require("../middlewares/verifyAccessToken");
const { AdminRoutes } = require("./admin/admin.routes");
const { paymentsRoutes } = require("./public/payments");
const { adminProfileRoutes } = require("./public/profile");
const { userAuthRoutes } = require("./user/auth/auth");
const { UserRoutes } = require("./user/user.routes");

const router = require("express").Router(); 

router.use("/auth", userAuthRoutes);
router.use("/profile", verifyToken, adminProfileRoutes);
router.use("/payment", paymentsRoutes);
router.use("/admin", verifyToken, AdminRoutes);
router.use("/user", verifyToken, UserRoutes);
router.get("/sub/:configID", UserConfigController.configSubscription);

module.exports = {
    AllRoutes: router
}