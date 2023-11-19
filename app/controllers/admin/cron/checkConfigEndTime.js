const { bot } = require("../../../../bot/commands/start");
const { timestampToDate } = require("../../../../bot/utils/functions");
const { userModel } = require("../../../models/user");
const { smsService } = require("../../../services/sms.service");

const checkEndTime = async (alertDay = 2) => {
    const users = await userModel.find();
    users.filter(user => {
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
            if(day - alertDay == nowDay && month == nowMonth && year == nowYear ) {
                console.log('time:',`${user.first_name} ${user.last_name}`);
                // smsService.endTimeMessage(user.mobile, user.full_name, alertDay)
                // if(user.chatID) bot.telegram.sendMessage(user.chatID, `${user.first_name} ${user.last_name} محترم 2 روز تا پایان زمان کانفیگتون باقی مانده`)
            }
        })
    })
}
module.exports = {
    checkEndTime
}