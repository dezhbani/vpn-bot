const { planController } = require("../../controllers/admin/plan.controller");
const { checkPermission } = require("../../middlewares/permission.guard");

const router = require("express").Router();

router.post("/add", checkPermission("add-plan"), planController.addPlan);
router.get("/list", checkPermission("plan-list"), planController.getAllPlans);
router.delete("/delete/:id", checkPermission("delete-plan"), planController.deletePlan);
router.patch("/edit/:id", checkPermission("edit-plan"), planController.editPlan);

module.exports = {
    adminPlanRoutes: router
}