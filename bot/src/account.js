const { Markup } = require("telegraf");
const { userModel } = require("../../app/models/user");
const { getOTP, checkOTP } = require("../auth/auth");
const { validationMobile } = require("../utils/functions");

const userDetails = account => {
    return `🆔شناسه شما : ${account.chatID} \n\n👤اسم شما: ${account.first_name} ${account.last_name}\n📱 شماره موبایل: ${account.mobile}`
}

const account = bot => {
    let obj = {};
    bot.hears('🖥 حساب کاربری', async ctx => {
        const chatID = ''+ ctx.update.message.from.id;
        const account = await userModel.findOne({chatID}, {otp: 0, config: 0})
        if(account){
            ctx.reply(userDetails(account), Markup.keyboard([["جزئیات کانفیگ های من"], ["فاکتور های من"], ["بازگشت به منوی اصلی"]]).resize().oneTime())
        } else{
            ctx.reply('لطفا وارد حساب کاربری خود شوید', Markup.inlineKeyboard([{
                    text: "ورود به حساب کاربری",
                    callback_data: "ورود به حساب کاربری"
                }])
            )
        }
    })
    bot.action("ورود به حساب کاربری", async ctx => {
        const chatID = ctx.update.callback_query.from.id;
        const messageID = ctx.update.callback_query.message.message_id;
        bot.telegram.deleteMessage(chatID, messageID);
        const account = await userModel.findOne({chatID}, {otp: 0, config: 0});
        if(account){
            ctx.reply(userDetails(account), Markup.keyboard([["جزئیات کانفیگ های من"], ["فاکتور های من"]]).resize().oneTime())
        }else{
            ctx.reply("شماره موبایل ثبت شده برای کانفیگت رو بفرست");
            bot.on('text', async ctx => {
                const text = ctx.update.message.text;
                const isMobile = validationMobile(text)
                if(isMobile){
                    obj.mobile = text
                    const result = await getOTP(obj.mobile);
                    ctx.reply(result)
                } else if(10000 < + text && + text < 100000){
                    obj.code = text
                    const { mobile, code } = obj;
                    const checkOtp = await checkOTP(mobile, code, chatID)
                    ctx.reply(checkOtp)
                    signin = true
                } else{
                    ctx.reply("شماره موبایل وارد شده صحیح نیست")
                } 
            })
        }
    })
}

module.exports = {
    account
}