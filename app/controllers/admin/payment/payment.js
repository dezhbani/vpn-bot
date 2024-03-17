const { default: axios } = require("axios");
const { userModel } = require("../../../models/user");
const { tomanToRial, lastIndex } = require("../../../utils/functions");
const { REDIRECT_URL, BASE_URL } = process.env;

const paymentTransaction = async (description, pay, owner, userID) => {
    const bills = {
        buy_date: new Date().getTime(),
        for: {
            description,
            user: userID
        },
        price: pay,
        up: null
    }
    const billsResult = await userModel.updateOne({ _id: userID }, { $push: { bills }});
    let billID;
    if (billsResult.modifiedCount !== 0) {
        const bills = (await userModel.findById(userID)).bills;
        const lastBill = lastIndex(bills);
        billID = lastBill._id;
    };
    const ownerDetails = await userModel.findById(owner)
    const createPayLink = await axios.post(`${BASE_URL}/payment/create`, {
        amount: tomanToRial(pay),
        billID,
        description,
        user: ownerDetails,
        callback: `${REDIRECT_URL}/wallet/${billID}`
    })
    return createPayLink.data
}
module.exports = {
    paymentTransaction
}