const { default: mongoose } = require("mongoose");

const planSchema = new mongoose.Schema({
    name: {type: String, required: true},
    price: {type: String, required: true},
    user_count: {type: String, required: true},
    data_size: {type: String, required: true},
    pay_link: {type: String, required: false},
    count: {type: String, default: "0"},
    month: {type: Number, default: 1}
}, {
    versionKey: false
})

module.exports = {
    planModel: mongoose.model('plan', planSchema)
}