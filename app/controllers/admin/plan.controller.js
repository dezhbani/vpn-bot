const createHttpError = require("http-errors");
const { planModel } = require("../../models/plan");
const { addPlanSchema } = require("../../validations/admin/plan.schema");
const { StatusCodes } = require("http-status-codes");
const { IDvalidator } = require("../../validations/public.schema");
const { Controllers } = require("../controller");
const { copyObject } = require("../../utils/functions");

class planController extends Controllers {
    async addPlan(req, res, next){
        try {
            const planBody = await addPlanSchema.validateAsync(req.body);
            const { name, price, user_count, data_size, pay_link, count, month } = planBody
            const result = await planModel.create({ name, price, user_count, data_size, pay_link, count, month });
            if(!result) throw createHttpError.InternalServerError("پلن ساخته نشد")
            console.log(result);
            return res.status(StatusCodes.CREATED).json({
                statusCode: StatusCodes.CREATED, 
                message: "پلن ساخته شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async deletePlan(req, res, next){
        try {
            const { id } = req.params;
            await this.findPlanByID(id);
            const result = await planModel.deleteOne({ _id: id });
            if (result.deletedCount == 0) throw createHttpError.InternalServerError("پلن حذف نشد")
            return res.status(StatusCodes.OK).json({
                statusCode: StatusCodes.OK,
                message: "پلن حذف شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async editPlan(req, res, next){
        try {
            const { id } = req.params;
            const plan = await this.findPlanByID(id);
            const data = copyObject(req.body);
            console.log(data);
            const updateResult = await planModel.updateOne({ _id: plan.id }, { $set: data });
            console.log(updateResult);
            if (updateResult.modifiedCount == 0) throw createHttpError.InternalServerError("پلن آپدیت نشد");
            return res.status(StatusCodes.OK).json({
                statusCode: StatusCodes.OK,
                message: "پلن آپدیت شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async getAllPlans(req, res, next){
        try {
            const plans = await planModel.find()
            return res.status(StatusCodes.OK).json({
                statusCode: StatusCodes.OK, 
                plans
            })
        } catch (error) {
            next(error)
        }
    }
    async findPlanByID(planID) {
        console.log(planID);
        const { id } = await IDvalidator.validateAsync({ id: planID });
        const plan = await planModel.findById(id);
        if (!plan) throw createHttpError.NotFound("پلنی یافت نشد");
        return plan
    }
}

module.exports = {
    planController: new planController()
}