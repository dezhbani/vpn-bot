const { userModel } = require("../../models/user");
const { responseType } = require("../typeDefs/public.type");
const { checkToken } = require("./public.resolver");
const createHttpError = require("http-errors");

const completeُSignup = {
    type: responseType,
    args: {
        full_name: {type: String},
        first_name: {type: String}, 
        last_name: {type: String}
    },
    resolve: async (_, args, context) => {
        const {_id} = await checkToken(context);
        const { full_name, first_name, last_name } = args;
        const saveUserDetails = await userModel.updateOne({_id}, {$set: {full_name, first_name, last_name}})
        if(saveUserDetails.modifiedCount ==  0) throw createHttpError.InternalServerError("اطلاعات ثبت نشد")
        const response = {
            statusCode: 200,
            data: {
                message: "اطلاعات با موفقیت ثبت شد"
            }
        }
        return response
    }
}

module.exports = {
    completeُSignup
}