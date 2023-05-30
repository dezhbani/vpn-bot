const { AdminRoutes } = require("./admin/admin.routes");
const { userAuthRoutes } = require("./user/auth");

const router = require("express").Router(); 

router.use("/auth", userAuthRoutes);
router.use("/admin", AdminRoutes);

module.exports = {
    AllRoutes: router
}