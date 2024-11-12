const { UserProfileController } = require("../../controllers/user/profile.controller");

const router = require("express").Router();

router.post("/increase-wallet", UserProfileController.increaseWallet);
router.patch("/edit", UserProfileController.editProfileDetails);
router.post("/change-mobile", UserProfileController.changeMobile);
router.post("/check-otp", UserProfileController.checkOTP);
module.exports = {
    userProfileRoutes: router
}