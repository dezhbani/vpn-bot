const { paymentController } = require("../../controllers/admin/payment/payment.controller");
const { verifyToken } = require("../../middlewares/verifyAccessToken");
const router = require("express").Router();

router.post("/create", paymentController.createTransaction);
router.get("/verify/:billID/:authority", verifyToken, paymentController.verifyTransaction);
router.get("/verify/wallet/:billID/:authority", verifyToken, paymentController.verifyWalletTransaction);

module.exports = {
    adminPaymentsRoutes: router
}