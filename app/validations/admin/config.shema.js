const Joi = require("@hapi/joi");
const createHttpError = require("http-errors");
const { mongoID } = require("../public.schema");

const addConfigSchema = Joi.object({
    first_name: Joi.string().min(1).max(20).error(createHttpError.BadRequest("نام وارد شده صحیح نمی باشد")),
    last_name: Joi.string().min(1).max(20).error(createHttpError.BadRequest("نام خانوادگی وارد شده صحیح نمی باشد")),
    mobile: Joi.string().empty().length(11).pattern(/^09[0-9]{9}$/).error(createHttpError.BadRequest("شماره موبایل وارد شده صحیح نمی باشد")),
    planID: Joi.string().allow().pattern(mongoID).error(createHttpError.BadRequest("شناسه وارد شده صحیح نیست"))
})

const deleteConfigSchema = Joi.object({
    userID: Joi.string().allow().pattern(mongoID).error(createHttpError.BadRequest("شناسه کاربر صحیح نیست")),
    configID: Joi.string().allow().pattern(mongoID).error(createHttpError.BadRequest("شناسه کانفیگ صحیح نیست"))
})

module.exports = {
    addConfigSchema,
    deleteConfigSchema
}