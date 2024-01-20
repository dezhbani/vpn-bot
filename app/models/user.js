const { default: mongoose } = require("mongoose");
const ConfigSchema = new mongoose.Schema({
    name: {type: String, required: true}, 
    status: {type: Boolean, default: true},
    config_content: {type: String, required: true},
    expiry_date: {type: String, required: true},
    configID: {type: String, required: true},
    endData: {type: Boolean, default: false}
})
const forSchema = new mongoose.Schema({
    description: {type: String, default: '', required: true},
    user: {type: mongoose.Types.ObjectId, ref: 'user', default: undefined}
});
const bill = new mongoose.Schema({
    planID: {type: mongoose.Types.ObjectId, ref: 'plan', default: null},
    buy_date: {type: Number, default: new Date().getTime()},
    for: {type: forSchema, default: {}, required: true}, 
    price: {type: Number, default: null},
    up: {type: Boolean, default: true},
    paymentID: {type: mongoose.Types.ObjectId, ref: 'payment', default: null}
})
const UserSchema = new mongoose.Schema({
    first_name: {type: String},
    last_name: {type: String},
    full_name: {type: String, default: ''},
    mobile: {type: String},
    bills: {type: [bill], ref: 'plan', default: []},
    configs: {type: [ConfigSchema], default: []},
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