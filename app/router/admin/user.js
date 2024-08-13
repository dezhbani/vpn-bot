const { userController } = require("../../controllers/admin/user.controller");
const { checkPermission } = require("../../middlewares/permission.guard");

const router = require("express").Router();

router.post("/add", checkPermission("add-user"), userController.addUser);
// router.post("/resend", checkPermission("users-list"), userController.resendConfig);
router.get("/list", checkPermission("users-list"), userController.getAllUsers);
router.get("/:id", checkPermission("get-user-details"), userController.getUserByID);
router.get("/bill/:billID", checkPermission("get-bill-details"), userController.getBillByID);
router.patch("/edit/:id", checkPermission("edit-user"), userController.editUser);
router.patch("/wallet/:id", checkPermission("update-user-wallet"), userController.updateWallet);
router.post("/add-details", checkPermission("add-user-details"), userController.addUserDetails);

module.exports = {
    adminUserRoutes: router
}