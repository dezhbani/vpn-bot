const { profileController } = require("../../controllers/admin/profile.controller");
const { userController } = require("../../controllers/admin/user.controller");

const router = require("express").Router();

router.get("/", profileController.profile);

module.exports = {
    adminProfileRoutes: router
}