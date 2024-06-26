const express = require('express');
const cors = require("cors");
require("dotenv").config();
const morgan = require('morgan');
const path = require('path');
const http = require("http");
const { default: mongoose } = require("mongoose");
const {Telegraf, Markup} = require('telegraf');
const { start } = require('../bot/commands/start');
const startTelegramBot = require('../bot/commands/start');
const { BOT_TOKEN } = process.env;

module.exports = class Application{
    #app = express();
    #DB_URL;
    #PORT;
    constructor(PORT, DB_URL){
        this.#PORT = PORT;
        this.#DB_URL = DB_URL;
        this.configApplication();
        this.connectToDB();
        this.createServer();
        this.createRoutes();
        this.startBot();
        this.errorHandling();
    }
    configApplication(){
        this.#app.use(cors())
        this.#app.use(morgan("dev"));
        this.#app.use(express.json());
        this.#app.use(express.urlencoded({extended: true}));
        this.#app.use(express.static(path.join(__dirname, "..", "public"))); 
    }
    createServer(){
        const server = http.createServer(this.#app)
        server.listen(this.#PORT, () => {
            console.log(`run => http://localhost:${this.#PORT}`);
        })
    }
    connectToDB(){
        mongoose.connect(this.#DB_URL, (error) => {
        if (!error) return console.log("conected to MongoDB");
        return console.log(error);
        });
        mongoose.connection.on("connected", () => {
        console.log("mongoose connected to DB");
        });
        mongoose.connection.on("disconnected", () => {
        console.log("mongoose connection is disconnected");
        });
        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            console.log("disconnected");
            process.exit(0);
        });
    }
    createRoutes(){
        // this.#app.use(AllRoutes)
    }
    startBot(){
        startTelegramBot()
    }
    errorHandling(){
        this.#app.use((req, res, next) => {
                next(createError.NotFound("آدرس مورد نظر یافت نشد"))
        })
        this.#app.use((err, req, res, next) =>{
            const serverError = createError.InternalServerError("InternalServerError")
            console.log(err)
            const status = err.status || serverError.status;
            const message = err.message || serverError.message;
            return res.status(status).json({
                status,
                message
            })
        })
    }
}



// const { details } = require('./app/details');
// const { plans } = require('./app/plans');
// const fs = require('fs')
// // const key = fs.readFileSync("/etc/letsencrypt/live/s1.delta-dev.top/privkey.pem");
// // const cert = fs.readFileSync("/etc/letsencrypt/live/s1.delta-dev.top/fullchain.pem");
// // const server = https.createServer({ key, cert }, app);


// app.post('/bot', express.json(), (req, res) => {
//   bot.handleUpdate(req.body, res);
// });