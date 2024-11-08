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
const checkUserPaymentType = async (description, price, user, configID, planID = null) => {
    const { _id: userID, wallet } = user
    const bills = {
        configID,
        buy_date: new Date().getTime(),
        for: {
            description,
            user: userID
        },
        price,
        up: wallet > price || null
    }
    const billsResult = await userModel.updateOne({ _id: userID }, { $push: { bills } });
    let billID;
    if (billsResult.modifiedCount !== 0) {
        const bills = (await userModel.findById(userID)).bills;
        const lastBill = lastIndex(bills);
        billID = lastBill._id;
    };
    if (wallet < price) {
        const createPayLink = await axios.post(`${BASE_URL}/payment/create`, {
            amount: tomanToRial(price),
            billID,
            description: "افزایش اعتبار",
            user,
            callback: `${REDIRECT_URL}/wallet/${billID}`
        })
        return createPayLink.data
    } else if (wallet > price) {
        let deposit = wallet - price
        deposit = deposit < 0 ? 0 : deposit
        const updateWallet = await userModel.updateOne({ _id: userID }, { $set: { wallet: deposit } })
        if (updateWallet.modifiedCount == 0) throw createHttpError.InternalServerError("مشکلی پیش امد، لطفا به پشتیبانی اطلاع دهید")
        return null
    }
}
module.exports = {
    checkPaymentType,
    checkUserPaymentType
} 