const router = require("express").Router();
const { PermissionController } = require("../../controllers/admin/RBAC/permission.controller");
const { checkPermission } = require("../../middlewares/permission.guard");

router.post("/add", checkPermission("add-permission"), PermissionController.addPermission)
router.get("/list", checkPermission("permissions-list"), PermissionController.getAllPermission)
router.patch("/edit/:id", checkPermission("edit-permission"), PermissionController.editPermission)
router.delete("/delete/:id", checkPermission("delete-permission"), PermissionController.deletePermission)

module.exports = {
    adminPermissionRoutes: router
}