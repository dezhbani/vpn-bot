const router = require("express").Router();
const { RoleController } = require("../../controllers/admin/RBAC/role.controller");
const { stringToArray } = require("../../middlewares/stringToArray");

router.post("/add", stringToArray("permissions"), RoleController.addRole)
router.get("/list", RoleController.getAllRole)
router.patch("/edit/:id", stringToArray("permissions"), RoleController.editRole)
router.delete("/delete/:field", RoleController.deleteRole)

module.exports = {
    adminRoleRoutes: router
}