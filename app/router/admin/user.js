const { userController } = require("../../controllers/admin/user.controller");

const router = require("express").Router();

router.post("/add", userController.addUser);
// router.delete("/delete/:id", userController.deletePlan);
// router.patch("/edit/:id", userController.editPlan);
// router.get("/", userController.getAllPlans);

module.exports = {
    adminUserRoutes: router
}