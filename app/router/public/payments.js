const { paymentController } = require("../../controllers/public/payment.controller");
const { verifyToken } = require("../../middlewares/verifyAccessToken");

const router = require("express").Router();

router.post("/create", paymentController.createTransaction);
router.post("/verify/:authority", verifyToken, paymentController.verifyTransaction);
router.get("/verify/wallet/:billID/:authority", verifyToken, paymentController.verifyWalletTransaction);

module.exports = {
    paymentsRoutes: router
}