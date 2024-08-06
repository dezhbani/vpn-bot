const { profileController } = require("../../controllers/public/profile.controller");

const router = require("express").Router();

router.get("/", profileController.profile);
router.get("/bills", profileController.bills);

module.exports = {
    adminProfileRoutes: router
}