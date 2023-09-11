const { default: mongoose } = require("mongoose");
const ConfigSchema = new mongoose.Schema({
    name: {type: String, required: true}, 
    config_content: {type: String, required: true},
    expiry_date: {type: String, required: true},
    configID: {type: String, required: true}
})
const bill = new mongoose.Schema({
    planID: {type: mongoose.Types.ObjectId, ref: 'plan', default: null},
    buy_date: {type: Number, default: new Date().getTime()},
    for: {type: String, default: '', required: true}, 
    price: {type: Number, default: null},
    up: {type: Boolean, default: true}
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
    role: {type: String, default: 'customer'}
}, {
    versionKey: false
})

module.exports = {
    userModel: mongoose.model('user', UserSchema)
}