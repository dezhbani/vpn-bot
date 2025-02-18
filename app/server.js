const express = require('express');
const cors = require("cors");
require("dotenv").config();
const morgan = require('morgan');
const path = require('path');
// const http = require("http");
const https = require("https");
const { default: mongoose } = require("mongoose");
const { startTelegramBot } = require('../bot/commands/start');
const { AllRoutes } = require('./router/router');
const createHttpError = require('http-errors');
const cron = require('node-cron');
const fs = require('fs');
const { checkEndTime } = require('./controllers/admin/cron/checkConfigEndTime');
const { checkEndData } = require('./controllers/admin/cron/checkEndData');
const { configService } = require('./services/config.service');
const cache = require('./utils/cache');
// const key = fs.readFileSync("/etc/letsencrypt/live/api.delta-dev.top/privkey.pem");
// const cert = fs.readFileSync("/etc/letsencrypt/live/api.delta-dev.top/fullchain.pem");
module.exports = class Application {
    #app = express();
    #DB_URL;
    #PORT;
    constructor(PORT, DB_URL) {
        this.#PORT = PORT;
        this.#DB_URL = DB_URL;
        this.configApplication();
        this.connectToDB();
        this.createServer();
        this.createRoutes();
        this.setCookie();
        // this.checkConfig();
        // this.startBot();
        this.errorHandling();
    }
    configApplication() {
        this.#app.use(cors())
        this.#app.use(morgan("dev"));
        this.#app.use(express.json());
        this.#app.use(express.urlencoded({ extended: true }));
        this.#app.use(express.static(path.join(__dirname, "..", "public")));
    }
    createServer() {
        // const server = http.createServer(this.#app)
        const server = https.createServer({ key, cert }, app);
        server.listen(this.#PORT, () => {
            console.log(`run => http://localhost:${this.#PORT}`);
        })
    }
    connectToDB() {
        mongoose.set('strictQuery', false);
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
    createRoutes() {
        this.#app.use(AllRoutes)
    }
    async setCookie() {
        const setToken = async () => {
            const token = await configService.loginPanel()
            
            const cacheResult = cache.set("token", token)
            const cacheR = cache.get("token")
            console.log(cacheR);
            if (!cacheResult) throw createHttpError.InternalServerError("خطایی در دریافت توکن رخ داد")
        }
        setToken()
        cron.schedule('* * 9 20 * *', () => {
            setToken()

            // updateConfig(38, data)
            // console.log(process.env);
            // configController.replaceAllConfigs()
        })
    }
    startBot() {
        // startTelegramBot()
    }
    checkConfig() {
        // cron.schedule('* * 12 * *', () => {
        //     checkEndTime(2)
        // })
        // cron.schedule('* * * * *', () => {
        //     checkEndData(70)
        // })
    }
    errorHandling() {
        this.#app.use((req, res, next) => {
            next(createHttpError.NotFound("آدرس مورد نظر یافت نشد"))
        })
        this.#app.use((err, req, res, next) => {
            console.log(err);
            const serverError = createHttpError.InternalServerError("خظای داخلی سرور")
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
// const key = fs.readFileSync("/etc/letsencrypt/live/s1.delta-dev.top/privkey.pem");
// const cert = fs.readFileSync("/etc/letsencrypt/live/s1.delta-dev.top/fullchain.pem");
// const server = https.createServer({ key, cert }, app);


// app.post('/bot', express.json(), (req, res) => {
//   bot.handleUpdate(req.body, res);
// });