const { default: axios } = require('axios');
const { Markup } = require('telegraf');
const { clculate, totalConsumed, timestampToDate } = require("../utils/functions");
const { backMenu } = require('./plans');
const { V2RAY_API_URL, V2RAY_PANEL_TOKEN } = process.env
const details = bot =>{
    let list = []
    bot.hears('جزییات کانفیگ', async ctx => {
      list = (await axios.post(`${V2RAY_API_URL}/xui/inbound/list`,{}, {
        withCredentials: true,
        headers: {
          'Cookie': V2RAY_PANEL_TOKEN
        }
      })).data.obj
      ctx.reply("اسم کانفیگت رو بفرست")
      console.log(ctx.update.message.from);
      list.map(config =>{
        bot.hears(`${config.remark}`, ctx => {
          ctx.reply(`نام کانفیگ: ${config.remark} \n دانلود شده:  ${clculate(config.down).mass} ${clculate(config.down).massSymbol} \n آپلود شده:  ${clculate(config.up).mass} ${clculate(config.up).massSymbol} \n کل حجم:  ${config.total == 0? 'نا محدود' :( config.total / (1024 * 1024 * 1024)).toFixed(2)} GB \n کل حجم مصرف شده:  ${totalConsumed(config.up, config.down).mass} ${totalConsumed(config.up, config.down).massSymbol} \n تاریخ انقضا: ${timestampToDate(config.expiryTime)}`,
          Markup.keyboard(['بازگشت به منوی اصلی'])
          .oneTime()
          .resize()
          )
          backMenu(bot)
        })
      })
    });
}

module.exports = {
    details
}