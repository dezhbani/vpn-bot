const { default: axios } = require('axios');
const { Markup } = require('telegraf');
const { clculate, totalConsumed, timestampToDate } = require("../utils/functions");
const { userModel } = require('../../app/models/user');
const { checkLogin } = require('../middleware/checkLogin');
const { configModel } = require('../../app/models/config');
const { V2RAY_API_URL, V2RAY_TOKEN } = process.env;
const findConfigDetails = async id => {
  let list = [];
  list = (await axios.post(`${V2RAY_API_URL}/xui/inbound/list`,{}, {
    withCredentials: true,
    headers: {
      'Cookie': V2RAY_TOKEN
    }
  })).data.obj
  let configDetails = {}
  list.map(config => {
    const configID = JSON.parse(config.settings).clients[0].id;
    console.log(id, configID, configID == id, config.id);
    if(configID == id){
      configDetails = {
        up: config.up, 
        down: config.down, 
        total: config.total, 
        expiryTime: config.expiryTime, 
        remark: config.remark, 
        id: configID
      }
    }
  })
  return configDetails
}
const details = bot =>{
  bot.hears('جزئیات کانفیگ های من', checkLogin, async ctx => {
    const chatID = ''+ ctx.update.message.from.id;
    const account = await userModel.findOne({chatID})
    const configs = await configModel.find({userID: account._id})
    console.log(configs);
    let keyboards = [];
    const time = new Date().getTime();
    if(configs.length > 0){
      configs.map(config => {
        if(config.expiry_date ) keyboards.push({
            text: config.name,
            callback_data: config.configID
        })
        console.log(config.name, config.configID, keyboards);
        bot.action(config.configID, async ctx => {
          console.log('ssssssssss');
          const id = ctx.update.callback_query.data
          const configDetails = await findConfigDetails(id)
          console.log(configDetails);
          return ctx.reply(`🏷 نام کانفیگ: ${configDetails.remark} \n 📥 دانلود شده:  ${clculate(configDetails.down).mass} ${clculate(configDetails.down).massSymbol} \n 📤 آپلود شده:  ${clculate(configDetails.up).mass} ${clculate(configDetails.up).massSymbol} \n 📦 بسته فعلی شما:  ${configDetails.total == 0? 'نا محدود' :( configDetails.total / (1024 * 1024 * 1024)).toFixed(2)} GB \n ✅ کل حجم مصرف شده:  ${totalConsumed(configDetails.up, configDetails.down).mass} ${totalConsumed(configDetails.up, configDetails.down).massSymbol} \n 📅 تاریخ انقضا: ${timestampToDate(configDetails.expiryTime)}`)
        })
      })
    }
    const message = configs.length == 0?'کانفیگی وجود ندارد': 'کانفیگ مورد نظرت رو انتخاب کن😄'
    ctx.reply(message, configs && Markup.inlineKeyboard(keyboards))
  })
}

module.exports = {
    details
}