const Joi = require("@hapi/joi");
const createHttpError = require("http-errors");

const completeُSignupSchema = Joi.object({
    full_name: Joi.string().required().min(1).max(20).error(createHttpError.BadRequest("نام و نام خانوادگی فارسی صحیح نمی باشد")),
    first_name: Joi.string().required().min(1).max(20).error(createHttpError.BadRequest("نام صحیح نمی باشد")),
    last_name: Joi.string().required().min(1).max(20).error(createHttpError.BadRequest("نام خانوادگی صحیح نمی باشد")),
})

module.exports = {
    completeُSignupSchema
}