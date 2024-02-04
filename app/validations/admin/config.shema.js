const Joi = require("@hapi/joi");
const createHttpError = require("http-errors");
const { mongoID } = require("../public.schema");

const addConfigSchema = Joi.object({
    full_name: Joi.string().required().min(2).max(20).error(createHttpError.BadRequest("اسم وارد شده صحیح نمی باشد")),
    first_name: Joi.string().required().min(2).max(20).error(createHttpError.BadRequest("نام لاتین وارد شده صحیح نمی باشد")),
    last_name: Joi.string().required().min(2).max(20).error(createHttpError.BadRequest("نام خانوادگی لاتین وارد شده صحیح نمی باشد")),
    mobile: Joi.string().required().empty().length(11).pattern(/^09[0-9]{9}$/).error(createHttpError.BadRequest("شماره موبایل وارد شده صحیح نمی باشد")),
    planID: Joi.string().required().allow().pattern(mongoID).error(createHttpError.BadRequest("شناسه وارد شده صحیح نیست")),
    payType: Joi.string().required().error(createHttpError.BadRequest("نوع پرداخت انتخاب شده صحیح نمی باشد"))
})

const deleteConfigSchema = Joi.object({
    userID: Joi.string().allow().pattern(mongoID).error(createHttpError.BadRequest("شناسه کاربر صحیح نیست")),
    configID: Joi.string().allow().pattern(mongoID).error(createHttpError.BadRequest("شناسه کانفیگ صحیح نیست"))
})
const repurchaseConfigSchema = Joi.object({
    userID: Joi.string().allow().pattern(mongoID).error(createHttpError.BadRequest("شناسه کاربر صحیح نیست")),
    configID: Joi.string().allow().guid({version: 'uuidv4'}).error(createHttpError.BadRequest("شناسه کانفیگ صحیح نیست"))
})

module.exports = {
    addConfigSchema,
    deleteConfigSchema,
    repurchaseConfigSchema
}