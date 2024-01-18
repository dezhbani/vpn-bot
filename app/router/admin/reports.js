const { reportController } = require("../../controllers/admin/report.controller");

const router = require("express").Router();

router.get("/totalCustomer", reportController.getTotalCustomer);
router.get("/totalMonthIncome", reportController.getThisMonthIncome);
router.get("/myIncome", reportController.getMyThisMonthIncome);
router.get("/monthTrafic", reportController.getThisMonthTrafic);
router.get("/monthCustomer", reportController.getThisMonthCustomers);

module.exports = {
    adminReportRoutes: router
}