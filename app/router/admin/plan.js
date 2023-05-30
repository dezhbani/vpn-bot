const { planController } = require("../../controllers/admin/plan.controller");

const router = require("express").Router();

router.post("/add", planController.addPlan);
router.delete("/delete/:id", planController.deletePlan);
router.patch("/edit/:id", planController.editPlan);
router.get("/", planController.getAllPlans);

module.exports = {
    adminPlanRoutes: router
}