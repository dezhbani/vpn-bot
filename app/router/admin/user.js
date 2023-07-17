const { userController } = require("../../controllers/admin/user.controller");

const router = require("express").Router();

router.post("/add", userController.addUser);
router.post("/resend", userController.resendConfig);
router.get("/list", userController.getAllUsers);
router.get("/:id", userController.getUserByID);
router.patch("/edit/:id", userController.editUser);
router.post("/add-details", userController.addUserDetails);

module.exports = {
    adminUserRoutes: router
}