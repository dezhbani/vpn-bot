
const {Telegraf, Markup} = require('telegraf');
const { BOT_TOKEN } = process.env;

const startTelegramBot = () =>{
    console.log(BOT_TOKEN);
    const bot = new Telegraf('6054205575:AAFimlSqjXdaXfHHa3KBgmxP-LZ-WDcPAwA');
        bot.start(ctx => {
        const message = ctx.update.message
        ctx.reply(`سلام ${message.chat.first_name} خوش اومدی!🤗`, Markup.keyboard([['جزییات کانفیگ'], ['پلن ها']])
            .oneTime()
            .resize()
            );
        });
        // details(bot)
        // plans(bot)
        bot.launch();
}

module.exports = startTelegramBot