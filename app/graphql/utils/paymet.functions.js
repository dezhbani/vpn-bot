const { default: axios } = require("axios");
const createHttpError = require("http-errors");
const { userModel } = require("../../models/user");
const { REDIRECT_URL, BASE_URL } = process.env;


const lastIndex = (array = []) => {
    const last = array.length - 1;
    return array[last]
}
const tomanToRial = (rial) => {
    return rial * 10
}

const checkPaymentType = async (description, price, userID) => {
    const user = await userModel.findById(userID)
    const bills = {
        buy_date: new Date().getTime(),
        for: {
            description,
            user: userID
        },
        price,
        up: user.wallet > price || null
    }
    const billsResult = await userModel.updateOne({ _id: userID }, { $push: { bills }});
    let billID;
    if (billsResult.modifiedCount !== 0) {
        const bills = (await userModel.findById(userID)).bills;
        const lastBill = lastIndex(bills);
        billID = lastBill._id;
    };
    if(user.wallet < price) {
        const createPayLink = await axios.post(`${BASE_URL}/payment/create`, {
            amount: tomanToRial(price),
            billID,
            description: "افزایش اعتبار",
            user,
            callback: `${REDIRECT_URL}/wallet/${billID}`
        })
        return createPayLink.data
    } else if(user.wallet > price){
        let deposit = user.wallet - price
        deposit = deposit < 0? 0 :deposit
        const updateWallet = await userModel.updateOne({_id: userID}, {$set: {wallet: deposit}})
        if(updateWallet.modifiedCount == 0) throw createHttpError.InternalServerError("مشکلی پیش امد، لطفا به پشتیبانی اطلاع دهید")
        return null
    }
}
module.exports = {
    checkPaymentType
} 