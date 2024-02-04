const Joi = require("@hapi/joi");
const createHttpError = require("http-errors");
const getOtpSchema = Joi.object({
    mobile : Joi.string().length(11).pattern(/^09[0-9]{9}$/).error(createHttpError.BadRequest("شماره موبایل وارد شده صحیح نمی باشد"))
});
const checkOtpSchema = Joi.object({
    mobile : Joi.string().length(11).pattern(/^09[0-9]{9}$/).error(createHttpError.BadRequest("شماره موبایل صحیح نمی باشد")),
    code : Joi.string().min(4).max(6).error(createHttpError.BadRequest("کد ارسال شده صحیح نمی باشد")),
});

module.exports = {
    getOtpSchema,
    checkOtpSchema
}