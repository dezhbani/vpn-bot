const { Markup } = require("telegraf");
const { userModel } = require("../../app/models/user");
const checkLogin = async (ctx, next) => {
    const chatID = ''+ ctx.update.message.from.id;
        const account = await userModel.findOne({chatID}, {otp: 0, config: 0})
        if(account){
            next()
        } else{
            ctx.reply('لطفا وارد حساب کاربری خود شوید', Markup.inlineKeyboard([{
                    text: "ورود به حساب کاربری",
                    callback_data: "ورود به حساب کاربری"
                }])
            )
        }
}

module.exports = {
    checkLogin
}