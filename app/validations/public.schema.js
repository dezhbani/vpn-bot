const Joi = require("@hapi/joi");
const createHttpError = require("http-errors");
const mongoID = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i
const IDvalidator = Joi.object({
    id: Joi.string().pattern(mongoID).error(createHttpError.BadRequest("شناسه وارد شده صحیح نیست"))
})

module.exports = {
    IDvalidator, 
    mongoID
}