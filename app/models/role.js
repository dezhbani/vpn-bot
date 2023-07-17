const { default: mongoose } = require("mongoose");

const roleSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    permissions: {type: [mongoose.Types.ObjectId], ref: "premission", default: []}
}, {
    versionKey: false
})

module.exports = {
    roleModel: mongoose.model("role", roleSchema)
}