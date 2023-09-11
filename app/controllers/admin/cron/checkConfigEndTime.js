const { bot } = require("../../../../bot/commands/start");
const { timestampToDate } = require("../../../../bot/utils/functions");
const { userModel } = require("../../../models/user");
const { smsService } = require("../../../services/sms.service");

const checkEndTime = async () => {
    const users = await userModel.find();
    users.filter(user => {
        console.log(user.mobile)
        user.configs.map( async config => {
            const time = new Date(+config.expiry_date);
            const day = time.getDate()
            const month = time.getMonth() 
            const year = time.getFullYear()
            const nowDay = new Date().getDate()
            const nowMonth = new Date().getMonth() 
            const nowYear = new Date().getFullYear()
            time.setDate(nowDay + 2)
            time.setMonth(nowMonth + 1)
            console.log(user.full_name);
            if(day - 1 == nowDay && month == nowMonth && year == nowYear ) {
                smsService.endTimeMessage(user.mobile, user.full_name, 1)
                if(user.chatID) bot.telegram.sendMessage(user.chatID, `${user.first_name} ${user.last_name} محترم 2 روز تا پایان زمان کانفیگتون باقی مانده`)
            }
        })
    })
}
module.exports = {
    checkEndTime
}