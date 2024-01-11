const { userController } = require("../../controllers/admin/user.controller");

const router = require("express").Router();

router.post("/add", userController.addUser);
router.post("/resend", userController.resendConfig);
router.get("/list", userController.getAllUsers);
router.get("/:id", userController.getUserByID);
router.get("/bill/:billID", userController.getBillByID);
router.patch("/edit/:id", userController.editUser);
router.patch("/wallet/:id", userController.updateWallet);
router.post("/add-details", userController.addUserDetails);

module.exports = {
    adminUserRoutes: router
}