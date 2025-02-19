const createHttpError = require("http-errors");
const { randomNumber, signAccessToken } = require("../../../utils/functions");
const { checkOtpSchema, getOtpSchema } = require("../../../validations/user/auth.schema");
const { userModel } = require("../../../models/user");
const { Controllers } = require("../../controller");
const { smsService } = require("../../../services/sms.service");
const { completeُSignupSchema } = require("../../../validations/user/user.schema");
const { StatusCodes } = require("http-status-codes");

class userAuthControllers extends Controllers {
    async getOTP(req, res, next) {
        try {
            await getOtpSchema.validateAsync(req.body)
            const { mobile } = req.body;
            const code = randomNumber();
            const result = await this.saveUser(mobile, code)
            if (!result) return createHttpError.Unauthorized("ورود شما انجام نشد")
            const sendResult = await smsService.sendOTP(mobile, code)
            if (!sendResult) return createHttpError.Unauthorized("کد تایید ارسال نشد")
            return res.status(200).json({
                status: 200,
                message: "کد تایید ارسال شد",
                mobile
            });
        } catch (error) {
            next(error);
        }
    }
    async checkOTP(req, res, next) {
        try {
            await checkOtpSchema.validateAsync(req.body);
            const { mobile, code } = req.body;
            const user = await userModel.findOne({ mobile })
            if (!user) throw createHttpError.NotFound("کاربر یافت نشد");
            if (user.otp.code != code) throw createHttpError.Unauthorized("کد تایید صحیح نمیباشد");
            const now = Date.now();
            if (+user.otp.expireIn < +now) throw createHttpError.Unauthorized("کد تایید منقضی شده");
            const accessToken = await signAccessToken(user._id);
            const userDetails = {
                first_name: user.first_name,
                last_name: user.last_name,
                full_name: user.full_name,
                mobile: user.mobile,
                wallet: user.wallet,
                role: user.role
            }
            return res.status(200).json({
                status: 200,
                accessToken,
                message: "با موفقیت وارد شدید",
                user: userDetails
            })
        } catch (error) {
            next(error)
        }
    }
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
    async saveUser(mobile, code) {
        let otp = {
            code,
            expireIn: (new Date().getTime() + 120000)
        }
        const result = await this.checkExistUser(mobile);
        if (result) return (await this.updateUser(mobile, { otp }))
        return !!(await userModel.create({
            mobile,
            otp
        }))
    }
    async checkExistUser(mobile) {
        const user = await userModel.findOne({ mobile });
        return !!user
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
    userAuthControllers: new userAuthControllers()
}