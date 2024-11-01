const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { Controllers } = require("../controller");
const { deleteInvalidProperties, randomNumber, signAccessToken } = require("../../utils/functions");
const { userModel } = require("../../models/user");
const { smsService } = require("../../services/sms.service");
const { getOtpSchema, checkOtpSchema } = require("../../validations/user/auth.schema");

class UserProfileController extends Controllers {
    async editProfileDetails(req, res, next) {
        try {
            const { _id: userID, mobile } = req.user;
            const data = req.body;
            const BlackListFields = ["bills", "otp", "chatID", "wallet", "by", "role", "percent", "mobile"]
            deleteInvalidProperties(data, BlackListFields)
            const profileUpdateResult = await userModel.updateOne({ _id: userID }, { $set: data })
            if (!profileUpdateResult.modifiedCount) throw createHttpError.InternalServerError("به روزسانی انجام نشد")
            return res.status(StatusCodes.OK).json({
                statusCode: StatusCodes.OK,
                message: "پروفایلتان با موفقیت به روزرسانی شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async changeMobile(req, res, next) {
        try {
            const { mobile } = req.user;
            const { mobile: newMobile } = await getOtpSchema.validateAsync(req.body)
            
            const findUser = await this.checkExistUser(newMobile)
            if(findUser) throw createHttpError.BadRequest("کاربری با این شماره موبایل وجود دارد")
            const code = randomNumber();
            const result = await this.saveUserOTP(mobile, code)
            if(typeof result == 'string') throw createHttpError.Forbidden(result)
            if (!result) return createHttpError.InternalServerError("کد تایید ارسال نشد")
            const sendResult = await smsService.sendOTP(newMobile, code)
            if (!sendResult) return createHttpError.InternalServerError("کد تایید ارسال نشد")
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: "کد تایید ارسال شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async checkOTP(req, res, next) {
        try {
            await checkOtpSchema.validateAsync(req.body);
            const mobile = req.user.mobile
            const { mobile: newMobile, code } = req.body;
            console.log(newMobile, mobile);
            const user = await this.checkExistUser(mobile)
            if (!user) throw createHttpError.NotFound("کاربر یافت نشد");
            if (user.otp.code != code) throw createHttpError.Unauthorized("کد تایید صحیح نمیباشد");
            const now = Date.now();
            if (+user.otp.expireIn < +now) throw createHttpError.Unauthorized("کد تایید منقضی شده");
            await this.updateUser(mobile, { mobile: newMobile })
            const accessToken = await signAccessToken(user._id);
            return res.status(200).json({
                status: 200,
                accessToken,
                message: "شماره موبایل با موفقیت تغییر کرد"
            })
        } catch (error) {
            next(error)
        }
    }
    async saveUserOTP(mobile, code) {
        let otp = {
            code,
            expireIn: (new Date().getTime() + 120000)
        }
        const user = this.checkExistUser(mobile);
        if (user) return (await this.updateUser(mobile, { otp }))
        return "کاربری با این شماره موبایل ثبت شده"
    }
    async checkExistUser(mobile) {
        const user = await userModel.findOne({ mobile });
        return user
    }
    async updateUser(mobile, objectData = {}) {
        Object.keys(objectData).forEach(key => {
            if (["", " ", 0, undefined, null, "0", NaN].includes(objectData[key])) delete objectData[key];
        })
        const resultUpdate = await userModel.updateOne({ mobile }, { $set: objectData });
        return !!resultUpdate.modifiedCount
    }
}

module.exports = {
    UserProfileController: new UserProfileController()
}