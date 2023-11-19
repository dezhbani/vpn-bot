const { Markup } = require("telegraf")
const { planModel } = require("../../app/models/plan")
const { configController } = require("../../app/controllers/admin/config.controller")
const { userModel } = require("../../app/models/user")
const { percentOfNumber, configExpiryTime } = require("../../app/utils/functions")
const { createVlessKcp } = require("../../app/utils/config.type")
const { default: axios } = require("axios")
const { error } = require("@hapi/joi/lib/base")
const { V2RAY_API_URL, V2RAY_PANEL_TOKEN } = process.env

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
        let withLimitionPlans = []
        let plans = await planModel.find()
        plans = plans.filter(plan => + plan.user_count > 0)
        plans.map(plan => withLimitionPlans.push([`${plan.user_count} کاربر، ${plan.data_size} گیگ: ${plan.price} ت، ${plan.name}`]))
        withLimitionPlans.push(['بازگشت'])
        await ctx.reply('پلن های با محدودیت کاربر👇', Markup.keyboard(withLimitionPlans)
        .oneTime()
        .resize()
        )
        let selectedPlan = '';
        withLimitionPlans.map(plan => {
            bot.hears(plan, async ctx => {
                const text = ctx.update.message.text;
                const price = +text.split(' ')[4]
                const plan = await planModel.findOne({price});
                if(!plan) return ctx.reply('بسته ارسالی وجود ندارد❌');
                selectedPlan = plan
                return ctx.reply(`بسته انتخابی شما: \n ${plan.user_count} کاربر، ${plan.data_size} گیگ: ${plan.price} ت، ${plan.name}`, Markup.inlineKeyboard([
                    {
                        text: 'پرداخت از کیف پول',
                        callback_data: 'buy_from_wallet'
                    }
                ]))
            })
        })
        bot.action('buy_from_wallet', async ctx => {
            const plan = selectedPlan;
            ctx.reply("لطفا اطلاعات زیر را صورت انگلیسی و به ترتیب وارد کنید\n\nنام:\n نام خانوادگی:\n شماره موبایل:")
            const owner = await userModel.findOne({mobile: '09906345580'});
            bot.on('text', async ctx => {
                try {
                    const [ first_name, last_name, mobile ] = await ctx.update.message.text.split('\n')
                    const lastConfigID = await configController.getConfigID();
                    await configController.createUser(first_name, last_name, mobile, owner._id)
                    const user = await userModel.findOne({mobile})
                    if(+user.wallet < +plan.price) return ctx.reply("موجودی حساب شما کافی نمی باشد")
                    const fullName = `${user.first_name} ${user.last_name}`;
                    const { details, configContent: config_content, id } = await createVlessKcp(lastConfigID, plan, fullName)
                    const addConfig = await axios.post(`${V2RAY_API_URL}/xui/inbound/add`, details, {
                        withCredentials: true,
                        headers: {
                            'Cookie': V2RAY_PANEL_TOKEN
                        }
                    })
                    const configs = {
                        name: fullName,
                        config_content,
                        expiry_date: +configExpiryTime(plan.month), 
                        configID: id
                    }
                    const bills = {
                        planID: plan._id,
                        buy_date: new Date().getTime(),
                        for: {
                            description: 'خرید کانفیگ'
                        },
                        up: true, 
                        price: +plan.price
                    }
                    const ownerBills = {
                        planID: plan._id,
                        buy_date: new Date().getTime(),
                        for: {
                            description: 'ثبت کانفیگ توسط کاربر '
                        },
                        up: true, 
                        price: +plan.price
                    }
                    const wallet = user.wallet - plan.price;
                    // update owner
                    if(!addConfig.data.success) return ctx.reply("کانفیگ ایجاد نشد به پشتیبانی پیام ارسال شد. \nهر چه زود تر کانفیگ براتون ارسال میشه")
                    const updateWallet = await userModel.updateOne({ mobile: owner.mobile }, { $set: {wallet}, $push: {bills: ownerBills} })
                    // update user 
                    if(updateWallet.modifiedCount == 0) return ctx.reply('کانفیگ ثبت نشد به پشتیبانی پیام ارسال شد. \nهر چه زود تر کانفیگ براتون ارسال میشه"')
                    const saveResult = await userModel.updateOne({ mobile }, { $push: { configs, bills }})
                    if(saveResult.modifiedCount == 0) return ctx.reply("کانفیگ برای یوزر ذخیره نشد \nبه پشتیبانی پیام ارسال شد");
                    return ctx.reply(config_content)
                } catch (error) {
                    ctx.reply(error)
                }
            })
        })
    })
    bot.hears('بدون محدودیت کاربر', async ctx => {
        let unlimitedPlans = [];
        let plans = await planModel.find({user_count: 0});
        plans.map(plan => unlimitedPlans.push([`${plan.data_size} گیگ: ${plan.price} ت، ${plan.name}`]));
        unlimitedPlans.push(['بازگشت']);
        await ctx.reply('پلن های بدون محدودیت کاربر👇', Markup.keyboard(unlimitedPlans)
        .oneTime()
        .resize()
        )
        let selectedPlan = '';
        unlimitedPlans.map(plan => {
            bot.hears(plan, async ctx => {
                const text = ctx.update.message.text;
                const price = +text.split(' ')[2]
                const plan = await planModel.findOne({price});
                if(!plan) return ctx.reply('بسته ارسالی وجود ندارد❌');
                selectedPlan = plan;
                return ctx.reply(`بسته انتخابی شما: \n ${plan.data_size} گیگ: ${plan.price} ت، ${plan.name}`, Markup.inlineKeyboard([
                    {
                        text: 'پرداخت از کیف پول',
                        callback_data: 'buy_from_wallet'
                    }
                ]))
            })
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