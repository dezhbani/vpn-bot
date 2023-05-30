const { default: mongoose } = require("mongoose");
const ConfigSchema = new mongoose.Schema({
    name: {type: String}, 
    config_content: {type: String},
    expiry_date: {type: String},
})
const bill = new mongoose.Schema({
    planID: {type: mongoose.Types.ObjectId, ref: 'plan', required: true},
    buy_date: {type: Number, default: new Date().getTime()}
})
const UserSchema = new mongoose.Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    mobile: {type: String},
    bills: {type: [bill], ref: 'plan', default: []},
    config: {type: [ConfigSchema], default: []},
    otp: {type: Object, default: {
        code: 0,
        expireIn: 0
    }},
    chatID: {type: String, default: ''}
}, {
    versionKey: false
})

module.exports = {
    userModel: mongoose.model('user', UserSchema)
}