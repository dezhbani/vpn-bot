const { userModel } = require("../../app/models/user");
const { smsService } = require("../../app/services/sms.service");
const { randomNumber } = require("../../app/utils/functions");

const getOTP = async mobile => {
    const code = randomNumber();
    const result = await saveUser(mobile, code);
    if (!result) return "ورود شما انجام نشد";
    const newMobile = mobile.replace(/^0/, '98')
    await smsService.sendOTP(newMobile, code)
    console.log(code)
    return "کد تایید ارسال شد.برای ورود به حساب کاربری کد را وارد کنید"
}
const checkOTP = async (mobile, code, chatID) => {
    const user = await userModel.findOne({ mobile })
    if (!user) return "کاربر یافت نشد";
    if (user.otp.code != code) return "کد تایید صحیح نمیباشد";
    const now = Date.now();
    if (+user.otp.expireIn < +now) return "کد تایید منقضی شده";
    const updateResult = await userModel.updateOne({ mobile }, { $set: { chatID }})
    if(updateResult.modifiedCount == 0) return "مجدد وارد اکانت خود شوید"
    return "وارد اکانت خود شدید"
}
const saveUser = async (mobile, code, chatID) => {
    let otp = {
        code,
        expireIn: (new Date().getTime() + 120000)
    }
    const result = await checkExistUser(mobile);
    if (result) return (await updateUser(mobile, { otp, chatID }))
}
const checkExistUser = async mobile => {
    const user = await userModel.findOne({ mobile });
    return !!user
}
const updateUser = async (mobile, objectData = {}) => {
    Object.keys(objectData).forEach(key => {
        if (["", " ", 0, undefined, null, "0", NaN].includes(objectData[key])) delete objectData[key];
    })
    const resultUpdate = await userModel.updateOne({ mobile }, { $set: objectData });
    return !!resultUpdate.modifiedCount
}
module.exports = {
    getOTP,
    checkOTP
}