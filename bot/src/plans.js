const { Markup } = require("telegraf")
const { withLimition, unlimited, buyWithLimition } = require("../utils/plans.name")
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
        ctx.reply('✅به منوی اصلی بازگشتید', Markup.keyboard([['جزییات کانفیگ'], ['پلن ها']])
        .oneTime()
        .resize()
        )

    })
}
const plans = bot => {
    bot.hears('پلن ها', ctx => {
        ctx.reply('پلن ها',Markup.keyboard([['همه'], ['بدون محدودیت کاربر','با محدودیت کاربر'], ['بازگشت به منوی اصلی']])
        .oneTime()
        .resize()
        )
    })
    backMenu(bot)
    bot.hears('با محدودیت کاربر', ctx => {
        ctx.reply('🔴 پلنا رو میتونید شخصی سازی کنید و برا پلن دلخواهتون پیام بدید🔥\n @delltavpn \n\n  مطمئن باشید این کیفیت و امنیت و سرعت رو با این قیمت اصلا گرون نمی خرید ✅ .', Markup.keyboard(withLimition)
            .resize()
            .oneTime()
        )
        back(bot)
        withLimition.map(plan => {
            bot.hears(plan, ctx => {
                const index = withLimition.indexOf(plan)
                ctx.reply(`بسته انتخابی شما: \n ${plan}`, Markup.inlineKeyboard([
                    [Markup.button.url('پرداخت', buyWithLimition[index])]
                ]))
                bot.action(plan, ctx => {

                })
            })
        })
    bot.on('text', ctx=>{
        const text = ctx.update.message.text
        if(!withLimition.includes(text)) ctx.reply('بسته ارسالی وجود ندارد❌')
        
    })

    })
    bot.hears('بدون محدودیت کاربر', ctx => {
        ctx.reply('🔴 پلنا رو میتونید شخصی سازی کنید و برا پلن دلخواهتون پیام بدید🔥\n @delltavpn \n\n  مطمئن باشید این کیفیت و امنیت و سرعت رو با این قیمت اصلا گرون نمی خرید ✅ .', Markup.keyboard(unlimited)
            .oneTime()
            .resize()
        )
        back(bot)
    })
    bot.hears('همه', ctx => {
        ctx.reply('پلن های یک ماهه: \n🟢 ۲ کاربر، ۲۰ گیگ: ۷۰ تومن ( بسته پایه ) \n🟢 ۴ کاربر، ۲۰ گیگ: ۷۵ تومن ( بسته پایه - خانواده )\n \n🟢 ۲ کاربر، ۴۰ گیگ: ۸۵ تومن ( پکیج نقره )\n🟢 ۴ کاربر، ۴۰ گیگ: ۹۵ تومن ( پکیج نقره - خانواده )\n \n🟢 ۲ کاربر، ۶۰ گیگ: ۱۰۵ تومن ( بسته اقتصادی - طلا )\n🟢 ۴ کاربر، ۶۰ گیگ: ۱۱۰ تومن ( بسته اقتصادی‌طلایی- خانواده )\n\n🟢 ۲ کاربر، ۱۰۰ گیگ: ۱۵۰ تومن ( بسته کاربردی - الماس )\n🟢 ۴ کاربر، ۱۰۰گیگ: ۱۶۵ تومن ( بسته کاربردی‌الماسی - خانواده )\n\n🟢 ۲ کاربر، ۲۰۰ گیگ: ۲۷۰ تومن ( بسته توسعه‌دهندگان )\n🟢 ۴ کاربر، ۲۰۰ گیگ ۲۹۰ تومن ( بسته توسعه‌دهندگان - خانواده )\n\n-----------------------------------------------------------------------\n\n پلن های یک ماهه ( بدون محدودیت کاربر ):\n\n🟢 ۲۰ گیگ: ۹۰ تومن ( بسته پایه )\n\n🟢 ۴۰ گیگ: ۱۱۵ تومن ( پکیج نقره )\n\n🟢 ۶۰ گیگ: ۱۳۰ تومن ( بسته اقتصادی - طلا )\n\n🟢 ۱۰۰ گیگ: ۱۷۵ تومن ( بسته کاربردی - الماس )\n\n🟢 ۲۰۰ گیگ: ۳۱۰ تومن ( بسته توسعه‌دهندگان )')
        ctx.reply('🔴 پلنا رو میتونید شخصی سازی کنید و برا پلن دلخواهتون پیام بدید🔥\n @delltavpn \n\n  مطمئن باشید این کیفیت و امنیت و سرعت رو با این قیمت اصلا گرون نمی خرید ✅ .', Markup.keyboard([['همه'], ['بدون محدودیت کاربر','با محدودیت کاربر'], ['بازگشت به منوی اصلی']])
        .oneTime()
        .resize()
        )
    })
}

module.exports = {
    plans,
    backMenu
}