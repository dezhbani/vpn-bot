const { default: mongoose } = require("mongoose");
const ConfigSchema = new mongoose.Schema({
    name: {type: String, required: true}, 
    config_content: {type: String, required: true},
    expiry_date: {type: String, required: true},
    configID: {type: String, required: true}
})
const bill = new mongoose.Schema({
    planID: {type: mongoose.Types.ObjectId, ref: 'plan', required: true},
    buy_date: {type: Number, default: new Date().getTime()}
})
const UserSchema = new mongoose.Schema({
    first_name: {type: String},
    last_name: {type: String},
    mobile: {type: String},
    bills: {type: [bill], ref: 'plan', default: []},
    configs: {type: [ConfigSchema], default: []},
    otp: {type: Object, default: {
        code: 0,
        expireIn: 0
    }},
    chatID: {type: String}
}, {
    versionKey: false
})

module.exports = {
    userModel: mongoose.model('user', UserSchema)
}