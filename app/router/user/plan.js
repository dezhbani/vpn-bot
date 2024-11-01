const { UserConfigController } = require("../../controllers/user/config.controller");
const { UserPlanController } = require("../../controllers/user/plan.controller");

const router = require("express").Router();

router.get("/list", UserPlanController.getPlans);

module.exports = {
    userPlanRoutes: router
}