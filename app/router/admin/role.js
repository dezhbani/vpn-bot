const router = require("express").Router();
const { RoleController } = require("../../controllers/admin/RBAC/role.controller");
const { checkPermission } = require("../../middlewares/permission.guard");
const { stringToArray } = require("../../middlewares/stringToArray");

router.post("/add", checkPermission("add-role"), stringToArray("permissions"), RoleController.addRole)
router.get("/list", checkPermission("roles-list"), RoleController.getAllRole)
router.patch("/edit/:id", checkPermission("edit-role"), stringToArray("permissions"), RoleController.editRole)
router.delete("/delete/:field", checkPermission("delete-role"), RoleController.deleteRole)

module.exports = {
    adminRoleRoutes: router
}