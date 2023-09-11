const { default: mongoose } = require("mongoose");

const planSchema = new mongoose.Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true},
    user_count: {type: Number, required: true},
    data_size: {type: Number, required: true},
    pay_link: {type: String, required: false},
    month: {type: Number, default: 1}
}, {
    versionKey: false
})

module.exports = {
    planModel: mongoose.model('plan', planSchema)
}