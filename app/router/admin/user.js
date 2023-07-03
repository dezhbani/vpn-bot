const { userController } = require("../../controllers/admin/user.controller");

const router = require("express").Router();

router.post("/add", userController.addUser);
router.post("/resend", userController.resendConfig);
router.get("/:id", userController.getUserByID);
router.post("/add-details", userController.addUserDetails);
router.get("/", userController.getAllUsers);

module.exports = {
    adminUserRoutes: router
}