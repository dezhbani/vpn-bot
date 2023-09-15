const { bot } = require("../../../../bot/commands/start");
const { userModel } = require("../../../models/user");
const { smsService } = require("../../../services/sms.service");
const { configController } = require("../config.controller");

const checkEndData = async (percent) => {
    const configs = await configController.getAllConfigs()
    configs.map( async config => {
        const percentResult = (config.total / 100) * percent;
        const percentResult2 = (config.total / 100) * (percent + 5);
        const result = config.up + config.down 
        const configID = JSON.parse(config.settings).clients[0].id;    
        if(percentResult  < result && result < percentResult2) {
            const user = await userModel.findOne({'configs.configID': {$in: configID}});
            smsService.endData(user.mobile, user.full_name, `${percent} درصد`)
            bot.telegram.sendMessage('5803093467', `${user.full_name} محترم 60 درصد از حجم کانفیگتون مصرف شده برای مشاهده جزئیات کلیک کنید`, )
        }
    })
}
module.exports = {
    checkEndData
}