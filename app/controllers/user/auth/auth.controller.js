const createHttpError = require("http-errors");
const { randomNumber, signAccessToken, verifyRefreshToken } = require("../../../utils/functions");
const { checkOtpSchema, getOtpSchema } = require("../../../validations/user/auth.schema");
const { userModel } = require("../../../models/user");
const { Controllers } = require("../../controller");

class userAuthControllers extends Controllers {
    async getOTP(req, res, next) {
        try {
            await getOtpSchema.validateAsync(req.body)
            const { mobile } = req.body;
            const code = randomNumber();
            const result = await this.saveUser(mobile, code)
            if (!result) return createHttpError.Unauthorized("ورود شما انجام نشد")
            // const sendResult = await sendSMS(mobile, code)
            // if (!sendResult) return createHttpError.Unauthorized("کد تایید ارسال نشد")
            return res.status(200).send({
                data: {
                    statusCode: 200,
                    data: {
                        message: "کد تایید ارسال شد",
                        mobile,
                        code
                    }
                }
            });
        } catch (error) {
            console.log(error)
            next(createHttpError.BadRequest(error.message));
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
            return res.json({
                accessToken,
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