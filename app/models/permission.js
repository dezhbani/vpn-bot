const { default: mongoose } = require("mongoose");

const permissionSchema = new mongoose.Schema({
    name: {type: String, unique: true},
    main: {type: String, required: true},
    sub: {type: String, default: ''}

}, {
    versionKey: false
})

module.exports = {
    permissionModel: mongoose.model("permission", permissionSchema)
}