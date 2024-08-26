const { userAuthControllers } = require("../../../controllers/user/auth/auth.controller");

const router = require("express").Router();

router.post("/get-otp", userAuthControllers.getOTP);
router.post("/check-otp", userAuthControllers.checkOTP);

module.exports = {
    userAuthRoutes: router
}