const { default: mongoose } = require("mongoose");
const ConfigSchema = new mongoose.Schema({
    name: {type: String}, 
    config_content: {type: String}
})
const UserSchema = new mongoose.Schema({
    first_name: {type: String},
    last_name: {type: String},
    mobile: {type: String},
    bills: {type: [], default: []},
    config: {type: [ConfigSchema], default: []}
})

module.exports = {
    userModel: mongoose.model('user', UserSchema)
}