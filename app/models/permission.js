const { default: mongoose } = require("mongoose");

const permissionSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    section: {type: String, required: true, default: ""}
}, {
    versionKey: false
})

module.exports = {
    permissionModel: mongoose.model("permission", permissionSchema)
}