const { default: axios } = require("axios");
const { userModel } = require("../models/user");
const { lastIndex, tomanToRial } = require("./functions");
const createHttpError = require("http-errors");
const { REDIRECT_URL, BASE_URL } = process.env;

const checkPaymentType = async (description, price, ownerID, userID, configID) => {
    const owner = await userModel.findById(ownerID)
    const bills = {
        configID,
        buy_date: new Date().getTime(),
        for: {
            description,
            user: userID
        },
        price,
        up: owner.wallet > price || null
    }
    const billsResult = await userModel.updateOne({ _id: ownerID }, { $push: { bills } });
    let billID;
    if (billsResult.modifiedCount !== 0) {
        const bills = (await userModel.findById(ownerID)).bills;
        const lastBill = lastIndex(bills);
        billID = lastBill._id;
    };
    if (owner.wallet < price) {
        const createPayLink = await axios.post(`${BASE_URL}/payment/create`, {
            amount: tomanToRial(price),
            billID,
            description: "افزایش اعتبار",
            user: owner,
            callback: `${REDIRECT_URL}/wallet/${billID}`
        })
        return createPayLink.data
    } else if (owner.wallet > price) {
        let deposit = owner.wallet - price
        deposit = deposit < 0 ? 0 : deposit
        const updateWallet = await userModel.updateOne({ _id: ownerID }, { $set: { wallet: deposit } })
        if (updateWallet.modifiedCount == 0) throw createHttpError.InternalServerError("مشکلی پیش امد، لطفا به پشتیبانی اطلاع دهید")
        return null
    }
}
const increaseWallet = async (user, price, configID=null) => {
    const userID = user._id
    const bills = {
        configID,
        buy_date: new Date().getTime(),
        for: {
            description: "افزایش اعتبار",
            user: userID
        },
        price,
        up: null
    }
    const billsResult = await userModel.updateOne({ _id: userID }, { $push: { bills } });
    if (billsResult.modifiedCount == 0) throw createHttpError.InternalServerError("خطای داخلی سرور")
    const allBills = (await userModel.findById(userID)).bills;
    const lastBill = lastIndex(allBills);
    const billID = lastBill._id;
    const createPayLink = await axios.post(`${BASE_URL}/payment/create`, {
        amount: tomanToRial(price),
        billID,
        description: "افزایش اعتبار",
        user,
        callback: `${REDIRECT_URL}/wallet/${billID}`
    })
    return createPayLink.data
}
const checkUserPaymentType = async (description, { price, _id: planID }, user, configID) => {
    const { _id: userID, wallet } = user
    const deposit = wallet - price

    if (wallet < price) return increaseWallet(user, price - wallet, configID)
    else if (wallet >= price) {
        const bills = {
            configID,
            planID,
            buy_date: new Date().getTime(),
            for: {
                description,
                user: userID
            },
            price,
            up: true
        }
        const updateWallet = await userModel.updateOne({ _id: userID }, { $set: { wallet: deposit }, $push: { bills } })
        if (updateWallet.modifiedCount == 0) throw createHttpError.InternalServerError("مشکلی پیش امد، لطفا به پشتیبانی اطلاع دهید")
        return null
    }
}
module.exports = {
    checkPaymentType,
    checkUserPaymentType,
    increaseWallet
} 