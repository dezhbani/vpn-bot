const { userAuthControllers } = require("../../../controllers/user/auth/auth.controller");
const { verifyToken } = require("../../../middlewares/verifyAccessToken");

const router = require("express").Router();

router.post("/get-otp", userAuthControllers.getOTP);
router.post("/check-otp", userAuthControllers.checkOTP);
router.post("/complete-signup", verifyToken, userAuthControllers.completeُSignup);

module.exports = {
    userAuthRoutes: router
}