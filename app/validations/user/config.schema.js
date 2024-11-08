const Joi = require("@hapi/joi");
const createHttpError = require("http-errors");
const { mongoID } = require("../public.schema");

const addConfigSchema = Joi.object({
    planID: Joi.string().pattern(mongoID).required().error(createHttpError.BadRequest("شناسه وارد شده صحیح نیست"))
});

module.exports = {
    addConfigSchema
}