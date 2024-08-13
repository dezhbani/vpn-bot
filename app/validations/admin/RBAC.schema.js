const Joi = require("@hapi/joi");
const mongoID = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i

const addRoleSchema = Joi.object({
    title : Joi.string().min(3).max(30).error(new Error("عنوان نقش باید 3-30 کاراکتر باشد")),
    description : Joi.string().min(3).max(100).error(new Error("توضیحات نقش ها صحیح نمی باشد")),
    permission : Joi.array().items(Joi.string().pattern(mongoID)).error(new Error("دسترسی های ارسال شده صحیح نمی باشد"))
});
const addPermissionSchema = Joi.object({
    name : Joi.string().min(3).max(40).error(new Error("اسم دسترسی ها صحیح نمیباشد")),
    section : Joi.string().min(3).max(40).error(new Error("توضیحات دسترسی ها صحیح نمی باشد"))
});

module.exports = {
    addRoleSchema,
    addPermissionSchema
}