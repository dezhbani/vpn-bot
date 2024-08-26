const { planModel } = require("../../app/models/plan");
const { userModel } = require("../../app/models/user");
const { checkLogin } = require("../middleware/checkLogin");
const { timestampToDate } = require("../utils/functions");

const ITEMS_PER_PAGE = 5; // Number of bills to display per page

const bill = bot => {
    bot.hears('فاکتور های من', checkLogin, async ctx => {
        const chatID = '' + ctx.update.message.from.id;
        const user = await userModel.findOne({ chatID });
        const account = await planModel.populate(user, {
            path: 'bills.planID'
        });

        // Filter out any bills that don't have a valid plan associated
        account.bills = account.bills.filter(bill => bill.planID !== null);

        // Start with the first page
        await sendBillPage(ctx, account.bills, 1, true);
    });

    // Handling pagination with a callback
    bot.action(/paginate_(\d+)/, async ctx => {
        const page = parseInt(ctx.match[1]);
        const chatID = '' + ctx.update.callback_query.from.id;
        const user = await userModel.findOne({ chatID });
        const account = await planModel.populate(user, {
            path: 'bills.planID'
        });

        account.bills = account.bills.filter(bill => bill.planID !== null);
        await sendBillPage(ctx, account.bills, page, false);

        // Acknowledge the callback
        await ctx.answerCbQuery();
    });
}

// Function to send bills based on the page number
async function sendBillPage(ctx, bills, page, isFirstPage) {
    let plans = '';
    let total = 0;

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const paginatedBills = bills.slice(startIndex, endIndex);

    // Determine date range for the current page
    const pageDates = paginatedBills.map(bill => new Date(bill.buy_date));
    const fromDate = new Date(Math.min(...pageDates)).toLocaleDateString('fa-IR');
    const toDate = new Date(Math.max(...pageDates)).toLocaleDateString('fa-IR');

    paginatedBills.forEach(bill => {
        const { buy_date, planID: plan } = bill;
        plans += `\n\n 🏷 نام بسته:  ${plan.name} \n🕙 مدت زمان کانفیگ: ${plan.month} ماهه \n👥 تعداد کاربر: ${plan.user_count} کاربر \n↕️ حجم کانفیگ: ${plan.data_size} گیگ \n💰 قیمت کانفیگ: ${plan.price} تومان\n📅 تاریخ خرید: ${timestampToDate(+buy_date, true)}`;
        total += (+plan.price);
    });

    plans += `\n\n‏🧮 مجموع خرید شما : ${total} تومان`;

    // Add dynamic date range to the message
    plans += `\n\n🗓 تاریخ شروع: ${fromDate} \n🗓 تاریخ پایان: ${toDate}\n\n سپاس از حسن انتخابتون❤️`;

    // Pagination controls
    const totalPages = Math.ceil(bills.length / ITEMS_PER_PAGE);
    let buttons = [];

    if (page > 1) {
        buttons.push({ text: '◀️ قبلی', callback_data: `paginate_${page - 1}` });
    }

    if (page < totalPages) {
        buttons.push({ text: 'بعدی ▶️', callback_data: `paginate_${page + 1}` });
    }

    if (page < totalPages - 1) {
        buttons.push({ text: 'آخرین', callback_data: `paginate_${totalPages}` });
    }

    // Edit the existing message or send a new one
    if (isFirstPage) {
        await ctx.reply(plans, {
            reply_markup: {
                inline_keyboard: [buttons]
            }
        });
    } else {
        await ctx.editMessageText(plans, {
            reply_markup: {
                inline_keyboard: [buttons]
            }
        });
    }
}

module.exports = {
    bill
}
