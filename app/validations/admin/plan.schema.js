const Joi = require("@hapi/joi");
const createHttpError = require("http-errors");

const addPlanSchema = Joi.object({
    name: Joi.string().required().min(1).max(40).error(createHttpError.BadRequest("عنوان پلن صحیح نمی باشد")),
    price: Joi.number().required().error(createHttpError.NotFound("قیمت مورد نظر  صحیح نمی باشد")),
    user_count: Joi.number().required().error(createHttpError.NotFound("تعداد کاربر مورد نظر  صحیح نمی باشد")),
    data_size: Joi.number().required().error(createHttpError.NotFound("حجم بسته مورد نظر صحیح نمی باشد")),
    pay_link: Joi.string().required().error(createHttpError.NotFound("لینک درگاه پرداخت  صحیح نمی باشد")),
    month: Joi.number().required().error(createHttpError.NotFound("ماه مورد صحیح نمی باشد")),
})

module.exports = {
    addPlanSchema
}