const { userController } = require("../../controllers/admin/user.controller");
const { UserProfileController } = require("../../controllers/user/profile.controller");
const { checkPermission } = require("../../middlewares/permission.guard");

const router = require("express").Router();

router.post("/complete-signup", UserProfileController.completeُSignup);
router.patch("/edit", UserProfileController.editProfileDetails);
module.exports = {
    userProfileRoutes: router
}