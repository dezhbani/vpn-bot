const { bot } = require("../../../../bot/commands/start");
const { userModel } = require("../../../models/user");
const { smsService } = require("../../../services/sms.service");
const { copyObject } = require("../../../utils/functions");
const { configController } = require("../config.controller");

const checkEndData = async (percent) => {
    const configs = await configController.getAllConfigs();
    configs.map( async config => {
        const percentResult = (config.total / 100) * percent;
        const percentResult2 = (config.total / 100) * (percent + 5);
        const result = config.up + config.down 
        const configID = JSON.parse(config.settings).clients ? JSON.parse(config.settings).clients[0]?.id : '';
        if(percentResult  < result && result < percentResult2 && config.enable) {
            const user = await userModel.findOne({'configs.configID': {$in: configID}});
            const configDetails = user.configs.filter(config => config.configID == configID && !(+config.expiry_date < new Date().getTime()))
            let message
            if(!configDetails[0].endData) message = await smsService.endData(user.mobile, user.full_name, `${percent} درصد`)
            const index = user.configs.findIndex(config => config == configDetails[0])
            const newConfigs = copyObject(user.configs);
            configDetails[0].endData = true
            newConfigs[index] = configDetails[0]
            if(!configDetails[0].endData && Number.isInteger(message)) await userModel.updateOne({'configs.configID': {$in: configID}}, {$set: {configs: newConfigs}});
            // bot.telegram.sendMessage('5803093467', `${user.full_name} محترم 60 درصد از حجم کانفیگتون مصرف شده برای مشاهده جزئیات کلیک کنید`, )
        }
    })
}
module.exports = {
    checkEndData
}