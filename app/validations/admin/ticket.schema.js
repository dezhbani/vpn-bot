const Joi = require("@hapi/joi");
const createHttpError = require("http-errors");

const createTicketSchema = Joi.object({
    title: Joi.string().required().min(10).max(30).error(createHttpError.BadRequest("موضوع تیکت صحیح نمی باشد")),
    description: Joi.string().required().min(2).error(createHttpError.BadRequest("توضیخات تیکت صحیح نمی باشد"))
})
const replyTicketSchema = Joi.object({
    reply: Joi.string().required().error(createHttpError.BadRequest("جواب تیکت صحیح نمی باشد"))
})

module.exports = {
    createTicketSchema,
    replyTicketSchema
}