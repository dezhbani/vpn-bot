const { Markup } = require("telegraf")
const { planModel } = require("../../app/models/plan")
const back = bot => {
    bot.hears('بازگشت', ctx => {
        ctx.reply('✅به منوی قبلی بازگشتید', Markup.keyboard([['همه'], ['بدون محدودیت کاربر','با محدودیت کاربر'], ['بازگشت به منوی اصلی']])
        .oneTime()
        .resize()
    )
    })
}
const backMenu = bot => {
    bot.hears('بازگشت به منوی اصلی', ctx => {
        ctx.reply('✅به منوی اصلی بازگشتید', Markup.keyboard([['🖥 حساب کاربری'], ['🛍 پلن ها']])
        .oneTime()
        .resize()
        )

    })
}
const plans = bot => {
    bot.hears('🛍 پلن ها', ctx => {
        ctx.reply('پلن ها',Markup.keyboard([['همه'], ['بدون محدودیت کاربر','با محدودیت کاربر'], ['بازگشت به منوی اصلی']])
        .oneTime()
        .resize()
        )
    })
    backMenu(bot)
    back(bot)
    bot.hears('با محدودیت کاربر', async ctx => {
        let plans = await planModel.find()
        plans = plans.filter(plan => + plan.user_count > 0)
        let withLimitionPlans = []
        plans.map(plan => withLimitionPlans.push([`${plan.user_count} کاربر، ${plan.data_size} گیگ: ${plan.price}ت، ${plan.name}`]))
        withLimitionPlans.push(['بازگشت'])
        await ctx.reply('پلن های با محدودیت کاربر👇', Markup.keyboard(withLimitionPlans)
        .oneTime()
        .resize()
        )
        bot.on('text', ctx => {
            const text = ctx.update.message.text;
            const flattenedPlans = [].concat(...withLimitionPlans);
            if(!flattenedPlans.includes(text)) ctx.reply('بسته ارسالی وجود ندارد❌');
        })
    })
    bot.hears('بدون محدودیت کاربر', async ctx => {
        let plans = await planModel.find({user_count: '0'});
        let unlimitedPlans = [];
        plans.map(plan => unlimitedPlans.push([`${plan.data_size} گیگ: ${plan.price}ت، ${plan.name}`]));
        unlimitedPlans.push(['بازگشت']);
        await ctx.reply('همه پلن ها👇', Markup.keyboard(unlimitedPlans)
        .oneTime()
        .resize()
        )
        bot.on('text', ctx => {
            const text = ctx.update.message.text;
            const flattenedPlans = [].concat(...unlimitedPlans);
            if(!flattenedPlans.includes(text)) ctx.reply('بسته ارسالی وجود ندارد❌');
        })
    })
    bot.hears('همه', async ctx => {
        const plans = await planModel.find()
        let planWithLimition = '';
        let planWithOutLimition = '';
        plans.map(plan => {
            if(plan.user_count  == 0){
                planWithOutLimition = `${planWithOutLimition}\n ${plan.data_size} گیگ: ${plan.price}ت، ${plan.name}`
            } else{
                planWithLimition = `${planWithLimition}\n ${plan.user_count} کاربر، ${plan.data_size} گیگ: ${plan.price}ت، ${plan.name}`
            }
        })
        const plansStr = `پلن های یک ماهه:\n ${planWithLimition} \n\n ---------------------------------------------------------------------- \n\n  پلن های یک ماهه ( بدون محدودیت کاربر ):\n ${planWithOutLimition}`;
        await ctx.reply('همه پلن ها👇', Markup.keyboard([['همه'], ['بدون محدودیت کاربر','با محدودیت کاربر'], ['بازگشت به منوی اصلی']])
        .oneTime()
        .resize()
        )
        ctx.reply(plansStr)
    })
}

module.exports = {
    plans,
    backMenu
}