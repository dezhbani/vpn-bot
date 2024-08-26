const { userProfileRoutes } = require("./profile");

const router = require("express").Router();

router.use("/profile", userProfileRoutes);

module.exports = {
    UserRoutes: router
}