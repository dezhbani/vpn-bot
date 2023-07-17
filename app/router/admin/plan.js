const { planController } = require("../../controllers/admin/plan.controller");

const router = require("express").Router();

router.post("/add", planController.addPlan);
router.get("/list", planController.getAllPlans);
router.delete("/delete/:id", planController.deletePlan);
router.patch("/edit/:id", planController.editPlan);

module.exports = {
    adminPlanRoutes: router
}