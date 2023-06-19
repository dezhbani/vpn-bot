const Joi = require("@hapi/joi");
const createHttpError = require("http-errors");

const addUserSchema = Joi.object({
    first_name: Joi.string().min(1).max(20).error(createHttpError.BadRequest("نام صحیح نمی باشد")),
    last_name: Joi.string().min(1).max(20).error(createHttpError.BadRequest("نام خانوادگی صحیح نمی باشد")),
    mobile : Joi.string().length(11).pattern(/^09[0-9]{9}$/).error(createHttpError.BadRequest("شماره موبایل وارد شده صحیح نمی باشد"))
})

module.exports = {
    addUserSchema
}