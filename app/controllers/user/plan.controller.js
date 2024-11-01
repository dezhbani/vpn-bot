const { StatusCodes } = require("http-status-codes");
const { Controllers } = require("../controller");
const { planModel } = require("../../models/plan");

class UserPlanController extends Controllers {
    async getPlans(req, res, next){
        try {
            const plans = await planModel.find()
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                plans: plans
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = {
    UserPlanController: new UserPlanController()
}