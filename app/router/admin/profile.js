const { profileController } = require("../../controllers/admin/profile.controller");
const { userController } = require("../../controllers/admin/user.controller");

const router = require("express").Router();

router.get("/", profileController.profile);
router.get("/bills", profileController.bills);

module.exports = {
    adminProfileRoutes: router
}