const { graphqlHTTP } = require("express-graphql");
const { checkPermission } = require("../middlewares/permission.guard");
const { verifyToken } = require("../middlewares/verifyAccessToken");
const { AdminRoutes } = require("./admin/admin.routes");
const { adminPaymentsRoutes } = require("./admin/payments");
const { adminProfileRoutes } = require("./public/profile");
const { userAuthRoutes } = require("./user/auth");
const { graphqlConfig } = require("../graphql/configs/graphql.config");

const router = require("express").Router(); 

router.use("/auth", userAuthRoutes);
router.use("/profile", verifyToken, adminProfileRoutes);
router.use("/payment", adminPaymentsRoutes);
router.use("/graphql", graphqlHTTP(graphqlConfig))
router.use("/admin", verifyToken, AdminRoutes);

module.exports = {
    AllRoutes: router
}