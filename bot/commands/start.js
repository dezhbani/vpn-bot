const {Telegraf, Markup} = require('telegraf');
const { details } = require('../src/details');
const { plans } = require('../src/plans');
const { BOT_TOKEN } = process.env;

const startTelegramBot = () =>{
    const bot = new Telegraf(BOT_TOKEN);
        bot.start(ctx => {
        const message = ctx.update.message
        ctx.reply(`سلام ${message.chat.first_name} خوش اومدی!🤗`, Markup.keyboard([['جزییات کانفیگ'], ['پلن ها']])
            .oneTime()
            .resize()
            );
        });
        details(bot)
        plans(bot)
        bot.launch();
}

module.exports = startTelegramBot