const { default: mongoose } = require("mongoose");
const forSchema = new mongoose.Schema({
    description: {type: String, default: '', required: true},
    user: {type: mongoose.Types.ObjectId, ref: 'user', default: undefined}
});
const bill = new mongoose.Schema({
    planID: {type: mongoose.Types.ObjectId, ref: 'plan', default: null},
    paymentID: {type: mongoose.Types.ObjectId, ref: 'payment', default: null},
    configID: {type: String, ref: 'config', default: null},
    buy_date: {type: Number, default: new Date().getTime()},
    for: {type: forSchema, default: {}, required: true}, 
    price: {type: Number, default: null},
    up: {type: Boolean, default: true}
})
const UserSchema = new mongoose.Schema({
    first_name: {type: String, default: ''},
    last_name: {type: String, default: ''},
    full_name: {type: String, default: ''},
    mobile: {type: String},
    bills: {type: [bill], ref: 'plan', default: []},
    otp: {type: Object, default: {
        code: 0,
        expireIn: 0
    }},
    chatID: {type: String},
    wallet: {type: Number, default: 0},
    by: {type: mongoose.Types.ObjectId, ref: 'users', default: this._id},
    role: {type: String, default: 'customer'},
    percent: {type: Number}
}, {
    versionKey: false,
    timestamps:{
        createdAt: true,
        updatedAt: true
    }
})

module.exports = {
    userModel: mongoose.model('user', UserSchema)
}