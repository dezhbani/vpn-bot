const { planModel } = require("../../app/models/plan");
const { userModel } = require("../../app/models/user");
const { timestampToDate } = require("../utils/functions");

const bill = bot => {
    bot.hears('فاکتور های من', async ctx => {
        const chatID = ''+ ctx.update.message.from.id;
        const user = await userModel.findOne({chatID})
        const account = await planModel.populate(user, {
            path: 'bills.planID'
        })
        let plans = '';
        let total = 0
        account.bills.map(bill => {
            const { buy_date, planID: plan } = bill;
            plans = `${plans}\n\n 🏷 نام بسته:  ${plan.name} \n🕙 مدت زمان کانفیگ: ${plan.month} ماهه \n👥 تعداد کاربر: ${plan.user_count} کاربر \n↕️ حجم کانفیگ: ${plan.data_size} گیگ \n💰 قیمت کانفیگ: ${plan.price} تومان\n📅 تاریخ خرید: ${timestampToDate(buy_date, true)}`
            total += (+plan.price)
        })
        plans = `${plans} \n\n‏🧮 مجموع خرید شما : ${total} تومان`
        return ctx.reply(plans)
    })
}

module.exports = {
    bill
}