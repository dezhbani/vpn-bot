const { default: mongoose } = require("mongoose");

const replySchema = new mongoose.Schema({
    user: {type: mongoose.Types.ObjectId, ref: "user", required: true},
    reply: {type: String, required: true}
}, {
    versionKey: false,
    timestamps:{
        createdAt: true,
        updatedAt: true
    }
})

const ticketSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    user: {type: mongoose.Types.ObjectId, ref: "user", required: true},
    status: {type: String, default: "باز"},
    reply: {type: [replySchema], default: []},
    updatedAt: {type: String, default: `${(new Date().getTime())}`}
}, {
    versionKey: false,
    timestamps:{
        createdAt: true,
        updatedAt: true
    }
})

module.exports = {
    ticketModel: mongoose.model("ticket", ticketSchema)
}