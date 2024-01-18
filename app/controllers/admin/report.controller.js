const { StatusCodes } = require("http-status-codes");
const { userModel } = require("../../models/user");
const { Controllers } = require("../controller");
const { planModel } = require("../../models/plan");
const { getStartAndEndOfMonthTimestamps } = require("../../utils/functions");

class reportController extends Controllers {
    async getTotalCustomer(req, res, next) {
        try {
            const user = req.user;
            const totalCustomers = await userModel.countDocuments({by: user._id})
            return res.status(StatusCodes.OK).json({
                totalCustomer: totalCustomers
            })
        } catch (error) {
            next(error)
        }
    }
    async getThisMonthIncome(req, res, next) {
        try {
            const user = req.user;
            const { startTimestamp, endTimestamp } = getStartAndEndOfMonthTimestamps();
            let adminBills = user.bills;
            adminBills = adminBills.filter(bill => bill.for.user && bill.planID && bill.buy_date > startTimestamp && bill.buy_date < endTimestamp)
            const total = await planModel.populate(adminBills , {
                path: 'planID'
            })
            let totalMonthIncome = 0;
            total.map(({planID: plan}) => totalMonthIncome += plan.price)
            return res.status(StatusCodes.OK).json({
                totalIncome: totalMonthIncome
            })
        } catch (error) {
            next(error)
        }
    }
    async getMyThisMonthIncome(req, res, next) {
        try {
            const user = req.user;
            const { startTimestamp, endTimestamp } = getStartAndEndOfMonthTimestamps();
            let adminBills = user.bills;
            adminBills = adminBills.filter(bill => bill.for.user && bill.planID && bill.buy_date > startTimestamp && bill.buy_date < endTimestamp)
            const total = await planModel.populate(adminBills , {
                path: 'planID'
            })
            let totalMonthIncome = 0;
            total.map(({planID: plan}) => totalMonthIncome += plan.price)
            const monthIncome = totalMonthIncome * 0.6;
            return res.status(StatusCodes.OK).json({
                myIncome: monthIncome
            })
        } catch (error) {
            next(error)
        }
    }
    async getThisMonthTrafic(req, res, next) {
        try {
            const user = req.user;
            const { startTimestamp, endTimestamp } = getStartAndEndOfMonthTimestamps();
            let adminBills = user.bills;
            adminBills = adminBills.filter(bill => bill.for.user && bill.planID && bill.buy_date > startTimestamp && bill.buy_date < endTimestamp)
            const total = await planModel.populate(adminBills , {
                path: 'planID'
            })
            let traficOfThisMonth = 0;
            total.map(({planID: plan}) => traficOfThisMonth += plan.data_size)
            return res.status(StatusCodes.OK).json({
                trafic: traficOfThisMonth
            })
        } catch (error) {
            next(error)
        }
    }
    async getThisMonthCustomers(req, res, next) {
        try {
            const user = req.user;
            const { startTimestamp, endTimestamp } = getStartAndEndOfMonthTimestamps();
            const customers = await userModel.find({by: user._id})
            const monthCustomer = [];
            customers.filter(customer => customer.createdAt > startTimestamp && customer.createdAt < endTimestamp)
            return res.status(StatusCodes.OK).json({
                monthCustomers: monthCustomer.length
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = {
    reportController: new reportController()
}