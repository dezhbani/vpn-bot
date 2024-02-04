const { default: mongoose } = require("mongoose");
const Schema = new mongoose.Schema({
    userID: {type: mongoose.Types.ObjectId, ref: "user", required: true}, 
    planID: {type: mongoose.Types.ObjectId, ref: "plan", required: true}, 
    configID: {type: String, required: true},
    name: {type: String, required: true}, 
    status: {type: Boolean, default: true},
    config_content: {type: String, required: true},
    expiry_date: {type: Number, required: true},
    endData: {type: Boolean, default: false}
}, {
    timestamps: true,
    versionKey: false
});
module.exports = {
    configModel : mongoose.model("config", Schema)
}