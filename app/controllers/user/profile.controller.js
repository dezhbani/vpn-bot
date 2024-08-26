const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { Controllers } = require("../controller");
const { completeُSignupSchema } = require("../../validations/user/user.schema");
const { deleteInvalidProperties } = require("../../utils/functions");
const { userModel } = require("../../models/user");

class UserProfileController extends Controllers {
    async completeُSignup(req, res, next){
        try {
            const { _id } = req.user
            const { full_name, first_name, last_name } = await completeُSignupSchema.validateAsync(req.body);
            const saveUserDetails = await userModel.updateOne({_id}, {$set: {full_name, first_name, last_name}})
            if(saveUserDetails.modifiedCount ==  0) throw createHttpError.InternalServerError("اطلاعات ثبت نشد")
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: "اطلاعات با موفقیت ثبت شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async editProfileDetails(req, res, next){
        try {
            const userID = req.user._id;
            const data = req.body;
            const BlackListFields = ["bills", "otp", "chatID", "wallet", "by", "role", "percent", "mobile"]
            deleteInvalidProperties(data, BlackListFields)
            const profileUpdateResult = await userModel.updateOne({_id: userID}, { $set: data })
            if(!profileUpdateResult.modifiedCount) throw createHttpError.InternalServerError("به روزسانی انجام نشد")
            return res.status(StatusCodes.OK).json({
                statusCode: StatusCodes.OK,
                message: "پروفایلتان با موفقیت به روزرسانی شد",
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = {
    UserProfileController: new UserProfileController()
}