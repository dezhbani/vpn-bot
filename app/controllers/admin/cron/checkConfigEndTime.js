const { bot } = require("../../../../bot/commands/start");
const { userModel } = require("../../../models/user");
const { smsService } = require("../../../services/sms.service");

const checkEndTime = async (alertDay = 2) => {
    const users = await userModel.find();
    users.filter(user => {
        user.configs.map( async config => {
            // user config time
            const time = new Date(+config.expiry_date);
            const month = time.getMonth() 
            const year = time.getFullYear()
            // // now time
            const today = new Date();
            const nowMonth = new Date().getMonth() 
            const nowYear = new Date().getFullYear()
            time.setMonth(nowMonth + 1)
            const daysUntilTime = Math.ceil((time - today) / (1000 * 60 * 60 * 24));
            if(daysUntilTime == alertDay && month == 1 && year == nowYear && config.status ) {
                const { mobile, first_name, last_name, full_name, chatID } = user;
                // smsService.endTimeMessage(mobile, full_name, alertDay)
                // if(user.chatID) bot.telegram.sendMessage(chatID, `${first_name} ${last_name} محترم 2 روز تا پایان زمان کانفیگتون باقی مانده`)
            }
        })
    })
}
module.exports = {
    checkEndTime
}