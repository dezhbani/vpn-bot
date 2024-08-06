const Joi = require("@hapi/joi");
const createHttpError = require("http-errors");
const { mongoID } = require("../public.schema");

const addConfigSchema = Joi.object({
    full_name: Joi.string().min(2).max(20).required().error(createHttpError.BadRequest("اسم وارد شده صحیح نمی باشد")),
    first_name: Joi.string().min(2).max(20).required().error(createHttpError.BadRequest("نام لاتین وارد شده صحیح نمی باشد")),
    last_name: Joi.string().min(2).max(20).required().error(createHttpError.BadRequest("نام خانوادگی لاتین وارد شده صحیح نمی باشد")),
    mobile: Joi.string().length(11).pattern(/^09[0-9]{9}$/).required().error(createHttpError.BadRequest("شماره موبایل وارد شده صحیح نمی باشد")),
    planID: Joi.string().pattern(mongoID).required().error(createHttpError.BadRequest("شناسه وارد شده صحیح نیست"))
});
const deleteConfigSchema = Joi.object({
    configID: Joi.string().allow().guid({version: 'uuidv4'}).error(createHttpError.BadRequest("شناسه کانفیگ صحیح نیست"))
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