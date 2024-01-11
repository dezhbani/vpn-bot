const { default: mongoose } = require("mongoose");
const Schema = new mongoose.Schema({
    invoiceNumber: {type: String},
    authority: {type: String},
    paymentDate: {type: Number},
    amount: {type: Number},
    description: {type: String, default: "بابت خرید پلن"},
    verify: {type: Boolean, default: false},
    user: {type: mongoose.Types.ObjectId, ref: "user"},
    refID: {type: String, default: undefined},
    cardHash: {type: String, default: undefined},
}, {timestamps: true});
module.exports = {
    PaymentModel : mongoose.model("payment", Schema)
}