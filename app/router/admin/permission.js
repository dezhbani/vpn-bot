const router = require("express").Router();
const { PermissionController } = require("../../controllers/admin/RBAC/permission.controller");

router.post("/add", PermissionController.addPermission)
router.get("/list", PermissionController.getAllPermission)
router.patch("/edit/:id", PermissionController.editPermission)
router.delete("/delete/:id", PermissionController.deletePermission)

module.exports = {
    adminPermissionRoutes: router
}