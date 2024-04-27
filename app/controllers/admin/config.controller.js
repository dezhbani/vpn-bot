const createHttpError = require("http-errors");
const { planModel } = require("../../models/plan");
const { StatusCodes } = require("http-status-codes");
const { deleteConfigSchema, repurchaseConfigSchema, addConfigSchema, buyConfigSchema } = require("../../validations/admin/config.shema");
const { Controllers } = require("../controller");
const { percentOfNumber, lastIndex, configExpiryTime, copyObject, exportConfigDetails } = require("../../utils/functions");
const { V2RAY_API_URL, V2RAY_TOKEN, REDIRECT_URL } = process.env
const { default: axios } = require('axios');
const { userModel } = require("../../models/user");
const { createVlessKcp } = require("../../utils/config.type");
const { smsService } = require("../../services/sms.service");
const { configModel } = require("../../models/config");
const { paymentController } = require("./payment/payment.controller");
const fs = require("fs");


class configController extends Controllers {
    async buyConfig(req, res, next){
        try {
            const { payType, planID, full_name, first_name, last_name, mobile } = await addConfigSchema.validateAsync(req.body);
            const owner = req.user
            await this.createUser(full_name, first_name, last_name, mobile, owner._id)
            if(!(payType == 'مستقیم' || payType == 'اعتبار')) throw createHttpError.BadRequest("نوع پرداخت انتخاب شده صحیح نمی باشد");
            if(payType == 'مستقیم') {
                const plan = await planModel.findById(planID);
                const percentOfPlan = percentOfNumber(plan.price, 70);
                const user = await userModel.findOne({mobile})
                const ownerBills = {
                    planID,
                    buy_date: new Date().getTime(),
                    for: {
                        description: 'ثبت کانفیگ',
                        user: user._id
                    },
                    up: null, 
                    price: percentOfPlan
                }
                const updateOwnerBills = await userModel.updateOne({ mobile: owner.mobile }, { $push: {bills: ownerBills} })
                if(updateOwnerBills.modifiedCount == 0) throw createHttpError.InternalServerError("مشکلی رخ داد لطفا محدد تلاش کنید")
                const bills = (await userModel.findById(owner._id)).bills;
                const billID = lastIndex(bills)._id;
                const newBody = {
                    amount: 10000,
                    description: "خرید بسته",
                    billID,
                    user: req.user,
                    callback: `${REDIRECT_URL}/payment/${billID}`
                }
                req.body = {...req.body, ...newBody}
                const transactionResult = await paymentController.createTransaction(req, res, next)
                return transactionResult
            }
            if(payType == 'اعتبار') return this.addConfig(req, res, next);
        } catch (error) {
            next(error)
        }
    }
    async addConfig(req, res, next){
        try {
            const owner = req.user
            const { full_name, first_name, last_name, mobile, planID, payType } = await addConfigSchema.validateAsync(req.body);
            const plan = await this.findPlanByID(planID);
            const percentOfPlan = percentOfNumber(plan.price, 70);
            if(owner.wallet < percentOfPlan) throw createHttpError.BadRequest("موجودی حساب شما کافی نمی باشد")
            const lastConfigID = await this.getConfigID();
            await this.createUser(full_name, first_name, last_name, mobile, owner._id)
            const user = await userModel.findOne({mobile})
            const fullName = `${user.first_name} ${user.last_name}`;
            const { details, configContent: config_content, id } = await createVlessKcp(lastConfigID, plan, fullName)
            const addConfig = await axios.post(`${V2RAY_API_URL}/xui/inbound/add`, details, {
                withCredentials: true,
                headers: {
                    'Cookie': V2RAY_TOKEN
                }
            })
            const configs = {
                name: fullName,
                config_content,
                expiry_date: +configExpiryTime(plan.month), 
                configID: id,
                userID: user._id,
                planID: plan._id
            }
            const bills = {
                planID,
                buy_date: new Date().getTime(),
                for: {
                    description: 'خرید کانفیگ'
                },
                up: true, 
                price: plan.price
            }
            const ownerBills = {
                planID,
                buy_date: new Date().getTime(),
                for: {
                    description: 'ثبت کانفیگ',
                    user: user._id
                },
                up: true, 
                price: percentOfPlan
            }
            const wallet = owner.wallet - percentOfPlan;
            // update owner
            if(!addConfig.data.success) throw createHttpError.InternalServerError("کانفیگ ایجاد نشد")
            const updateWallet = await userModel.updateOne({ mobile: owner.mobile }, { $set: {wallet}, $push: {bills: ownerBills} })
            // update user 
            if (payType == 'اعتبار') {
                await configModel.create(configs)
            }
            if(updateWallet.modifiedCount == 0) throw createHttpError.InternalServerError('کانفیگ ثبت نشد')
            const saveResult = await userModel.updateOne({ mobile }, {$push: {bills}})
            if(saveResult.modifiedCount == 0) throw createHttpError("کانفیگ برای یوزر ذخیره نشد");
            return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.CREATED, 
                message: "کانفیگ ایجاد شد",
                configContent: config_content
            })
        } catch (error) {
            next(error)
        }
    }
    async getAll(req, res, next){
        try {
            const { _id: userID } = req.user;
            await this.updateConfigDetails()
            const adminsCustomer = await userModel.find({by: userID}, {_id: 1})
            const adminAllConfigs = await configModel.find({userID: { $in: adminsCustomer } })
            const list = adminAllConfigs.map(config => {
                const data = copyObject(config)
                data.port = ((config.config_content.split(':')[2]).split('?')[0])
                return data
            })
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                configs: list.length? list: null
            })
        } catch (error) {
            next(error)
        }
    }
    async getBYEndedTime(req, res, next){
        try {
            const { _id: ownerID } = req.user;
            const { day } = req.body;
            const alertDay = +day
            let list = [];
            const configs = await configModel.find();
            await Promise.all(
                configs.map(async config => {
                    // user config time
                    const time = new Date(+config.expiry_date);
                    const month = time.getMonth()
                    const year = time.getFullYear()
                    // now time
                    const today = new Date();
                    const nowMonth = new Date().getMonth() 
                    const nowYear = new Date().getFullYear()
                    let daysUntilTime = Math.abs(time.getTime() - today.getTime());
                    daysUntilTime = Math.ceil(daysUntilTime / (1000 * 60 * 60 * 24 ))
                    if(daysUntilTime - 1 == alertDay && month == nowMonth && year == nowYear && config.status ) {
                        const user = await userModel.findOne({by: ownerID, _id: config.userID});
                        if(!user) throw createHttpError.Forbidden("این کاربر توسط شما ثبت نشده،شما نمیتوانید اطلاعات آن را ببینید")
                        const { mobile, first_name, last_name, full_name, chatID, _id: userID } = user;
                        const { expiry_date, configID, name, status } = config;
                            const data = copyObject(config)
                            data.port = ((config.config_content.split(':')[2]).split('?')[0])
                        list.push({mobile, name, userID, port: data.port, status, expiry_date, configID, untilEndTime: daysUntilTime - 1})
                    }
                })
            )
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                configs: list.length? list: null
            })
        } catch (error) {
            next(error)
        }
    }
    async getUserActiveConfigs(req, res, next){
        try {
            const { _id: ownerID } = req.user;
            const { userID } = req.params;
            const configs = await configModel.find({userID}, {endData: 0, createdAt: 0, updatedAt: 0})
            let list = await userModel.populate(configs, {
                path: 'userID',
                select: "by -_id"
            })
            list = await planModel.populate(list, {
                path: 'planID'
            })
            list = list.map(config => {
                const data = copyObject(config)
                data.port = ((config.config_content.split(':')[2]).split('?')[0])
                return data
            })
            list = list.filter(config => config.userID.by == `${ownerID}`)
            if(list.length == 0) throw createHttpError.NotFound("برای کاربر مورد نطر هیچ کانفیگی ثبت نشده")
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                list
            })
        } catch (error) {
            next(error)
        }
    }
    async deleteConfig(req, res, next){
        try {
            const { configID } = await deleteConfigSchema.validateAsync(req.body)
            const findV2rayConfig = await this.findConfigByID(configID)
            const config = await configModel.findOne({configID})
            if (!config || !findV2rayConfig) throw createHttpError.NotFound("کانفیگ مورد نظر وجود ندارد")
            findV2rayConfig.enable = false;
            const configResult = await this.updateConfig(findV2rayConfig.id, findV2rayConfig)
            const result = await configModel.updateOne({ configID }, {$set: {status: false}});
            if (result.modifiedCount == 0 || configResult.modifiedCount == 0) throw createHttpError.InternalServerError("کانفیگ حذف نشد")
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: "کانفیگ حذف شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async changeStatus(req, res, next){
        try {
            const { configID, userID } = req.body
            const user = await userModel.findById(userID)
            if(!user) throw createHttpError.NotFound("کاربر یافت نشد")
            let configsData = await this.findConfigByID(configID)
            if (!configsData) throw createHttpError.NotFound("کانفیگ مورد نظر وجود ندارد")
            configsData.enable = !configsData.enable;
            const result = await this.updateConfig(configsData.id, configsData)
            if(result) throw createHttpError.InternalServerError("مشکلی در تغییر وضعیت کانفیگ به وجود آمد")
            // update config
            const updateResult = await configModel.updateOne({configID}, {$set: {status: configsData.enable}})
            if(updateResult.modifiedCount == 0) {
                    configsData.enable = !configsData.enable;
                    await this.updateConfig(configsData.id, configsData)
                    throw createHttpError.InternalServerError("مشکلی در تغییر وضعیت کانفیگ به وجود آمد")
                }
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                message: configsData.enable? 'کانفیگ فعال شد': 'کانفیگ غیر فعال شد',
                configStatus: configsData.enable
            })
        } catch (error) {
            next(error)
        }
    }
    async repurchase(req, res, next){
        try {
            const owner = req.user
            const { userID, configID } = await repurchaseConfigSchema.validateAsync(req.body);
            const user = await userModel.findById(userID)
            if(!user) throw createHttpError.NotFound("کاربر یافت نشد")
            const config = await configModel.findOne({userID, configID})
            if(!config) throw createHttpError.NotFound("کانفیگ یافت نشد، لطفا با پشتیبانی تماس بگیرید")
            const plan = await planModel.findOne({_id: config.planID})
            if (!plan) throw createHttpError.NotFound("پلن مورد نظر وجود ندارد یا حذف شده، لطفا با پشتیبانی تماس بگیرید")
            let configsData = await this.findConfigByID(configID)
            if(!configsData) throw createHttpError.NotFound("کانفیگ یافت نشد، لطفا با پشتیبانی تماس بگیرید")
            configsData.expiryTime = +configExpiryTime(plan.month)
            configsData.up = 0
            configsData.down = 0
            configsData.enable = true
            const result = await this.updateConfig(configsData.id, configsData)
            const percentOfPlan = percentOfNumber(plan.price, 70)
            if(owner.wallet < percentOfPlan) throw createHttpError.BadRequest("موجودی حساب شما کافی نمی باشد")
            const bills = {
                planID: plan._id,
                buy_date: new Date().getTime(),
                for: {
                    description: 'تمدید کانفیگ'
                },
                up: true, 
                price: plan.price
            }
            const ownerBills = {
                planID: plan._id,
                buy_date: new Date().getTime(),
                for: {
                    description: 'تمدید کانفیگ کاربر',
                    user: user._id
                },
                up: true, 
                price: percentOfPlan
            }
            const wallet = owner.wallet - percentOfPlan;
            const updateWallet = await userModel.updateOne({ mobile: owner.mobile }, { $set: {wallet}, $push: {bills: ownerBills} })
            const updateConfig = await configModel.updateOne({ configID }, { $set: {expiry_date: +configExpiryTime(plan.month), endData: false}})
            // update user 
            if(result || updateWallet.modifiedCount == 0 || updateConfig.modifiedCount == 0) throw createHttpError.InternalServerError("کانفیگ تمدید نشد")
            const saveResult = await userModel.updateOne({ _id: userID }, { $push: { bills }})
            if(saveResult.modifiedCount == 0) throw createHttpError("کانفیگ برای یوزر ذخیره نشد");
            await smsService.repurchaseMessage(user.mobile, user.full_name)
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                message: "کانفیگ تمدید شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async deleteListOfConfigs(){
        arr = [41, 42, 43, 44, 45, 46, 47, 49];
        arr.map( async value => {
            const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/del/${value}`, {}, {
                withCredentials: true,
                headers: {
                    'Cookie': V2RAY_TOKEN
                }
            })).data
        })
    }
    async getAllConfigs(){
        const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/list`, {}, {
            withCredentials: true,
            headers: {
                'Cookie': V2RAY_TOKEN
            }
        })).data.obj
        // fs.writeFile('./configs.txt', ('' + configs))
        return configs
    }
    async getConfigID(){
        const configs = ((await axios.post(`${V2RAY_API_URL}/xui/inbound/list`,{}, {
            withCredentials: true,
            headers: {
              'Cookie': V2RAY_TOKEN
            }
        })).data.obj)
        const lastIndex = configs.length - 1
        const lastConfigID = configs[lastIndex].id + 1
        return lastConfigID
    }
    async createUser(full_name, first_name, last_name, mobile, by){
        const user = await userModel.findOne({mobile})
        if(!user){
          const newUser = await userModel.create({ full_name, first_name, last_name, mobile, by })
          if(!newUser) return createHttpError.InternalServerError('یوزر ثبت نشد')
        }
      if(!(JSON.stringify(user.by)== JSON.stringify(by))) throw createHttpError.Forbidden("این کاربر توسط ادمین دیگری ثبت شده")
    }
    async findConfigByID(configID) {
        const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/list`, {}, {
            withCredentials: true,
            headers: {
              'Cookie': V2RAY_TOKEN
            }
        })).data.obj
        const config = configs.filter(config => JSON.parse(config.settings).clients[0].id == configID);
        if (!config) throw createHttpError.NotFound("کانفیگی یافت نشد");
        return config[0]
    }
    async updateConfig(configID, data) {
        const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/update/${configID}`, data, {
            withCredentials: true,
            headers: {
              'Cookie': V2RAY_TOKEN
            }
        }))
        return configs.data.obj.success
    }
    async findPlanByID(planID) {
        const plan = await planModel.findById(planID);
        if (!plan) throw createHttpError.NotFound("پلنی یافت نشد");
        return plan
    }
    async replaceAllConfigs(req, res, next){
        try {
            const configs = [
                {
                  "id": 2,
                  "up": 2619382350,
                  "down": 39460700111,
                  "total": 53687091200,
                  "remark": "mahsa mashhadifam",
                  "enable": true,
                  "expiryTime": 0,
                  "clientStats": [
                    {
                      "id": 2,
                      "inboundId": 2,
                      "enable": true,
                      "email": "rsff54@x-ui-english.dev",
                      "up": 8270087872,
                      "down": 133657200934,
                      "expiryTime": 0,
                      "total": 0
                    }
                  ],
                  "listen": "",
                  "port": 22918,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"d27a61a0-f087-4958-bf52-7119b06ff857\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"rsff54@x-ui-english.dev\",\n      \"limitIp\": \"0\",\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"kcp\",\n  \"security\": \"none\",\n  \"kcpSettings\": {\n    \"mtu\": 1350,\n    \"tti\": 20,\n    \"uplinkCapacity\": 5,\n    \"downlinkCapacity\": 20,\n    \"congestion\": false,\n    \"readBufferSize\": 2,\n    \"writeBufferSize\": 2,\n    \"header\": {\n      \"type\": \"none\"\n    },\n    \"seed\": \"amu251vCRP\"\n  }\n}",
                  "tag": "inbound-22918",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 4,
                  "up": 17827629,
                  "down": 633053405,
                  "total": 107374182400,
                  "remark": "sadra ganbarnezhad",
                  "enable": true,
                  "expiryTime": 1712348940000,
                  "clientStats": [
                    {
                      "id": 4,
                      "inboundId": 4,
                      "enable": true,
                      "email": "uih458@x-ui-english.dev",
                      "up": 8928008336,
                      "down": 320690022870,
                      "expiryTime": 0,
                      "total": 0
                    }
                  ],
                  "listen": "",
                  "port": 43207,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"b0dd04d6-1f17-45bc-9d71-9420ae234a3e\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"uih458@x-ui-english.dev\",\n      \"limitIp\": \"4\",\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"kcp\",\n  \"security\": \"none\",\n  \"kcpSettings\": {\n    \"mtu\": 1350,\n    \"tti\": 20,\n    \"uplinkCapacity\": 5,\n    \"downlinkCapacity\": 20,\n    \"congestion\": false,\n    \"readBufferSize\": 2,\n    \"writeBufferSize\": 2,\n    \"header\": {\n      \"type\": \"none\"\n    },\n    \"seed\": \"VQwqJRM6kF\"\n  }\n}",
                  "tag": "inbound-43207",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 5,
                  "up": 1473418399,
                  "down": 36195993328,
                  "total": 64424509440,
                  "remark": "navid dezhbani",
                  "enable": true,
                  "expiryTime": 1709843340000,
                  "clientStats": [
                    {
                      "id": 5,
                      "inboundId": 5,
                      "enable": true,
                      "email": "sclbd4@x-ui-english.dev",
                      "up": 13997997594,
                      "down": 367228437964,
                      "expiryTime": 0,
                      "total": 0
                    }
                  ],
                  "listen": "",
                  "port": 31873,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"cd9af49a-97b9-4caa-8254-c28c9ac07c4c\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"sclbd4@x-ui-english.dev\",\n      \"limitIp\": 2,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
                  "tag": "inbound-31873",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 6,
                  "up": 272379249,
                  "down": 10369118413,
                  "total": 64424509440,
                  "remark": "reza mashhadifam",
                  "enable": true,
                  "expiryTime": 1710534540000,
                  "clientStats": [
                    {
                      "id": 6,
                      "inboundId": 6,
                      "enable": true,
                      "email": "eqj5i2@x-ui-english.dev",
                      "up": 2541083956,
                      "down": 70997204759,
                      "expiryTime": 0,
                      "total": 0
                    }
                  ],
                  "listen": "",
                  "port": 15220,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"c28d59fa-f295-4924-8796-c81b4bfced7e\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"eqj5i2@x-ui-english.dev\",\n      \"limitIp\": \"2\",\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
                  "tag": "inbound-15220",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 12,
                  "up": 821753048,
                  "down": 26132730156,
                  "total": 42949672960,
                  "remark": "reza dezhbani",
                  "enable": true,
                  "expiryTime": 1710016140000,
                  "clientStats": [
                    {
                      "id": 12,
                      "inboundId": 12,
                      "enable": true,
                      "email": "nxlcu0@x-ui-english.dev",
                      "up": 7057505631,
                      "down": 179366188835,
                      "expiryTime": 0,
                      "total": 0
                    }
                  ],
                  "listen": "",
                  "port": 48980,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"cfa594a5-5b78-47e7-909a-5fea400c1052\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"nxlcu0@x-ui-english.dev\",\n      \"limitIp\": \"2\",\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"kcp\",\n  \"security\": \"none\",\n  \"kcpSettings\": {\n    \"mtu\": 1350,\n    \"tti\": 20,\n    \"uplinkCapacity\": 5,\n    \"downlinkCapacity\": 20,\n    \"congestion\": false,\n    \"readBufferSize\": 2,\n    \"writeBufferSize\": 2,\n    \"header\": {\n      \"type\": \"none\"\n    },\n    \"seed\": \"NhTC6ZHv56\"\n  }\n}",
                  "tag": "inbound-48980",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 13,
                  "up": 1134756887,
                  "down": 31772538663,
                  "total": 0,
                  "remark": "laptop",
                  "enable": true,
                  "expiryTime": 0,
                  "clientStats": [],
                  "listen": "",
                  "port": 11453,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"1cb0cbe0-3a87-4963-932f-a98c69371ac9\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": \"\"\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
                  "tag": "inbound-11453",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 14,
                  "up": 2647517379,
                  "down": 76370843127,
                  "total": 0,
                  "remark": "Parivash",
                  "enable": true,
                  "expiryTime": 0,
                  "clientStats": [],
                  "listen": "",
                  "port": 14525,
                  "protocol": "vmess",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"b9031d87-b344-445f-8818-14f95e52cebe\",\n      \"alterId\": 0,\n      \"email\": \"\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": \"\"\n    }\n  ],\n  \"disableInsecureEncryption\": false\n}",
                  "streamSettings": "{\n  \"network\": \"kcp\",\n  \"security\": \"none\",\n  \"kcpSettings\": {\n    \"mtu\": 1350,\n    \"tti\": 20,\n    \"uplinkCapacity\": 5,\n    \"downlinkCapacity\": 20,\n    \"congestion\": false,\n    \"readBufferSize\": 2,\n    \"writeBufferSize\": 2,\n    \"header\": {\n      \"type\": \"none\"\n    },\n    \"seed\": \"l4yS9nO6Gf\"\n  }\n}",
                  "tag": "inbound-14525",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 17,
                  "up": 3039827695,
                  "down": 25180056495,
                  "total": 64424509440,
                  "remark": "mohammad ghorbani",
                  "enable": true,
                  "expiryTime": 1711225740000,
                  "clientStats": [
                    {
                      "id": 13,
                      "inboundId": 17,
                      "enable": true,
                      "email": "s781rg@x-ui-english.dev",
                      "up": 38880262512,
                      "down": 349234968033,
                      "expiryTime": 0,
                      "total": 0
                    }
                  ],
                  "listen": "",
                  "port": 21913,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"d67bd1e9-1687-4767-b3ac-b6b0c871083f\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"s781rg@x-ui-english.dev\",\n      \"limitIp\": \"0\",\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"kcp\",\n  \"security\": \"none\",\n  \"kcpSettings\": {\n    \"mtu\": 1350,\n    \"tti\": 20,\n    \"uplinkCapacity\": 5,\n    \"downlinkCapacity\": 20,\n    \"congestion\": false,\n    \"readBufferSize\": 2,\n    \"writeBufferSize\": 2,\n    \"header\": {\n      \"type\": \"none\"\n    },\n    \"seed\": \"VTcmdDvP5N\"\n  }\n}",
                  "tag": "inbound-21913",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 36,
                  "up": 660838912,
                  "down": 15612957832,
                  "total": 21474836480,
                  "remark": "matin dezhbani2",
                  "enable": true,
                  "expiryTime": 0,
                  "clientStats": [
                    {
                      "id": 37,
                      "inboundId": 36,
                      "enable": true,
                      "email": "p8zpaf@x-ui-english.dev",
                      "up": 651699463,
                      "down": 15701566173,
                      "expiryTime": 0,
                      "total": 0
                    }
                  ],
                  "listen": "",
                  "port": 13616,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"981eeb33-ea09-4174-9159-372caa9d7539\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"p8zpaf@x-ui-english.dev\",\n      \"limitIp\": 4,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
                  "tag": "inbound-13616",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 40,
                  "up": 980550619,
                  "down": 24989146765,
                  "total": 107374182400,
                  "remark": "azam ganbarnezhad",
                  "enable": true,
                  "expiryTime": 0,
                  "clientStats": [
                    {
                      "id": 43,
                      "inboundId": 40,
                      "enable": false,
                      "email": "67qtwx@x-ui-english.dev",
                      "up": 0,
                      "down": 0,
                      "expiryTime": 1702240140000,
                      "total": 107374182400
                    },
                    {
                      "id": 44,
                      "inboundId": 40,
                      "enable": true,
                      "email": "b6c9dh@x-ui-english.dev",
                      "up": 968467432,
                      "down": 25000190851,
                      "expiryTime": 0,
                      "total": 0
                    }
                  ],
                  "listen": "",
                  "port": 49243,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"ee341032-6e97-4a0c-9cf9-5a74913bbc77\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"b6c9dh@x-ui-english.dev\",\n      \"limitIp\": 4,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"kcp\",\n  \"security\": \"none\",\n  \"kcpSettings\": {\n    \"mtu\": 1350,\n    \"tti\": 20,\n    \"uplinkCapacity\": 5,\n    \"downlinkCapacity\": 20,\n    \"congestion\": false,\n    \"readBufferSize\": 2,\n    \"writeBufferSize\": 2,\n    \"header\": {\n      \"type\": \"none\"\n    },\n    \"seed\": \"vw0puf\"\n  }\n}",
                  "tag": "inbound-49243",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 53,
                  "up": 466012593,
                  "down": 19850842227,
                  "total": 42949672960,
                  "remark": "iraj amini",
                  "enable": false,
                  "expiryTime": 1707769740000,
                  "clientStats": [
                    {
                      "id": 62,
                      "inboundId": 53,
                      "enable": false,
                      "email": "3exvg3@x-ui-english.dev",
                      "up": 0,
                      "down": 0,
                      "expiryTime": 1706905740000,
                      "total": 21474836480
                    },
                    {
                      "id": 76,
                      "inboundId": 53,
                      "enable": false,
                      "email": "c4m48r@x-ui-english.dev",
                      "up": 459941891,
                      "down": 19832571601,
                      "expiryTime": 1707769740000,
                      "total": 42949672960
                    }
                  ],
                  "listen": "",
                  "port": 48271,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"301eebcf-ca15-447a-93d2-23dedb936013\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"c4m48r@x-ui-english.dev\",\n      \"limitIp\": 2,\n      \"totalGB\": 42949672960,\n      \"expiryTime\": 1707769740000\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
                  "tag": "inbound-48271",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 55,
                  "up": 55896361,
                  "down": 841875034,
                  "total": 21474836480,
                  "remark": "hamid dezhbani",
                  "enable": false,
                  "expiryTime": 1708759320887,
                  "clientStats": [
                    {
                      "id": 64,
                      "inboundId": 55,
                      "enable": false,
                      "email": "6e6ucf@x-ui-english.dev",
                      "up": 0,
                      "down": 0,
                      "expiryTime": 1706905740000,
                      "total": 21474836480
                    },
                    {
                      "id": 79,
                      "inboundId": 55,
                      "enable": false,
                      "email": "2s4j8r@x-ui-english.dev",
                      "up": 0,
                      "down": 0,
                      "expiryTime": 1707942540000,
                      "total": 21474836480
                    }
                  ],
                  "listen": "",
                  "port": 43130,
                  "protocol": "vmess",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"9932f8de-edef-4170-98b1-f7e9397a5307\",\n      \"alterId\": 0,\n      \"email\": \"\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": \"\"\n    }\n  ],\n  \"disableInsecureEncryption\": false\n}",
                  "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
                  "tag": "inbound-43130",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 63,
                  "up": 389402979,
                  "down": 1042862013,
                  "total": 42949672960,
                  "remark": "paria nasiri",
                  "enable": true,
                  "expiryTime": 1712348940000,
                  "clientStats": [
                    {
                      "id": 89,
                      "inboundId": 63,
                      "enable": true,
                      "email": "95lkxi@x-ui-english.dev",
                      "up": 7021907959,
                      "down": 47846287352,
                      "expiryTime": 0,
                      "total": 0
                    }
                  ],
                  "listen": "",
                  "port": 49717,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"b1759f98-75ec-444c-abed-8b7dafad3651\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"95lkxi@x-ui-english.dev\",\n      \"limitIp\": 2,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
                  "tag": "inbound-49717",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 64,
                  "up": 0,
                  "down": 0,
                  "total": 21474836480,
                  "remark": "matin dezhbani",
                  "enable": true,
                  "expiryTime": 1710880140000,
                  "clientStats": [
                    {
                      "id": 90,
                      "inboundId": 64,
                      "enable": false,
                      "email": "mraozw@x-ui-english.dev",
                      "up": 0,
                      "down": 0,
                      "expiryTime": 1709324940000,
                      "total": 21474836480
                    },
                    {
                      "id": 92,
                      "inboundId": 64,
                      "enable": false,
                      "email": "ijolxm@x-ui-english.dev",
                      "up": 0,
                      "down": 0,
                      "expiryTime": 1707078540000,
                      "total": 21474836480
                    },
                    {
                      "id": 93,
                      "inboundId": 64,
                      "enable": false,
                      "email": "f56zr2@x-ui-english.dev",
                      "up": 0,
                      "down": 0,
                      "expiryTime": 1707078540000,
                      "total": 21474836480
                    }
                  ],
                  "listen": "",
                  "port": 57407,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"909f99bd-9ca2-4db1-883c-93b9c5305a09\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"f56zr2@x-ui-english.dev\",\n      \"limitIp\": 2,\n      \"totalGB\": 21474836480,\n      \"expiryTime\": 1707078540000\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"kcp\",\n  \"security\": \"none\",\n  \"kcpSettings\": {\n    \"mtu\": 1350,\n    \"tti\": 20,\n    \"uplinkCapacity\": 5,\n    \"downlinkCapacity\": 20,\n    \"congestion\": false,\n    \"readBufferSize\": 2,\n    \"writeBufferSize\": 2,\n    \"header\": {\n      \"type\": \"none\"\n    },\n    \"seed\": \"bf851q\"\n  }\n}",
                  "tag": "inbound-57407",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 65,
                  "up": 69809201,
                  "down": 1653360033,
                  "total": 21474836480,
                  "remark": "matin dezhbani",
                  "enable": true,
                  "expiryTime": 1710880140000,
                  "clientStats": [
                    {
                      "id": 91,
                      "inboundId": 65,
                      "enable": false,
                      "email": "8cnlpf@x-ui-english.dev",
                      "up": 78047,
                      "down": 188335,
                      "expiryTime": 1709324940000,
                      "total": 21474836480
                    },
                    {
                      "id": 94,
                      "inboundId": 65,
                      "enable": true,
                      "email": "4lvlv5@x-ui-english.dev",
                      "up": 85210631,
                      "down": 1909214647,
                      "expiryTime": 0,
                      "total": 0
                    }
                  ],
                  "listen": "",
                  "port": 44196,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"516c8551-4781-4550-80ec-7e3e839aeb63\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"4lvlv5@x-ui-english.dev\",\n      \"limitIp\": 2,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"kcp\",\n  \"security\": \"none\",\n  \"kcpSettings\": {\n    \"mtu\": 1350,\n    \"tti\": 20,\n    \"uplinkCapacity\": 5,\n    \"downlinkCapacity\": 20,\n    \"congestion\": false,\n    \"readBufferSize\": 2,\n    \"writeBufferSize\": 2,\n    \"header\": {\n      \"type\": \"none\"\n    },\n    \"seed\": \"9i8tvd\"\n  }\n}",
                  "tag": "inbound-44196",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 66,
                  "up": 520087087,
                  "down": 18432990873,
                  "total": 26843545600,
                  "remark": "parsa pashazade",
                  "enable": true,
                  "expiryTime": 1711312140000,
                  "clientStats": [
                    {
                      "id": 95,
                      "inboundId": 66,
                      "enable": false,
                      "email": "szk6x9@x-ui-english.dev",
                      "up": 0,
                      "down": 0,
                      "expiryTime": 1707164940000,
                      "total": 21474836480
                    },
                    {
                      "id": 97,
                      "inboundId": 66,
                      "enable": true,
                      "email": "hp8ous@x-ui-english.dev",
                      "up": 2048608651,
                      "down": 44960594597,
                      "expiryTime": 0,
                      "total": 0
                    }
                  ],
                  "listen": "",
                  "port": 19922,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"45f425e8-6b8d-42a2-a8f1-9225a9abfe17\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"hp8ous@x-ui-english.dev\",\n      \"limitIp\": 2,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"kcp\",\n  \"security\": \"none\",\n  \"kcpSettings\": {\n    \"mtu\": 1350,\n    \"tti\": 20,\n    \"uplinkCapacity\": 5,\n    \"downlinkCapacity\": 20,\n    \"congestion\": false,\n    \"readBufferSize\": 2,\n    \"writeBufferSize\": 2,\n    \"header\": {\n      \"type\": \"none\"\n    },\n    \"seed\": \"uegt5p\"\n  }\n}",
                  "tag": "inbound-19922",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 67,
                  "up": 0,
                  "down": 0,
                  "total": 21474836480,
                  "remark": "matin dezhbani3",
                  "enable": true,
                  "expiryTime": 1711657740000,
                  "clientStats": [
                    {
                      "id": 96,
                      "inboundId": 67,
                      "enable": false,
                      "email": "hschi6@x-ui-english.dev",
                      "up": 0,
                      "down": 0,
                      "expiryTime": 1707164940000,
                      "total": 21474836480
                    },
                    {
                      "id": 98,
                      "inboundId": 67,
                      "enable": false,
                      "email": "9ed3do@x-ui-english.dev",
                      "up": 0,
                      "down": 0,
                      "expiryTime": 1707251340000,
                      "total": 21474836480
                    }
                  ],
                  "listen": "",
                  "port": 42136,
                  "protocol": "vless",
                  "settings": "{\"clients\":[{\"id\":\"e0831f42-9a03-4ce8-b2dd-6ef16f3fc67a\",\"flow\":\"xtls-rprx-direct\",\"email\":\"9ed3do@x-ui-english.dev\",\"limitIp\":2,\"totalGB\":21474836480,\"expiryTime\":1707251340000}],\"decryption\":\"none\",\"fallbacks\":[]}",
                  "streamSettings": "{\"network\":\"kcp\",\"security\":\"none\",\"kcpSettings\":{\"mtu\":1350,\"tti\":20,\"uplinkCapacity\":5,\"downlinkCapacity\":20,\"congestion\":false,\"readBufferSize\":2,\"writeBufferSize\":2,\"header\":{\"type\":\"none\"},\"seed\":\"ffh28q\"}}",
                  "tag": "inbound-42136",
                  "sniffing": "{\"enabled\":true,\"destOverride\":[\"http\",\"tls\"]}"
                },
                {
                  "id": 68,
                  "up": 123890219,
                  "down": 5337831037,
                  "total": 0,
                  "remark": "laptop2",
                  "enable": true,
                  "expiryTime": 0,
                  "clientStats": [
                    {
                      "id": 99,
                      "inboundId": 68,
                      "enable": false,
                      "email": "ssjjzf@x-ui-english.dev",
                      "up": 0,
                      "down": 0,
                      "expiryTime": 1707769740000,
                      "total": 21474836480
                    }
                  ],
                  "listen": "",
                  "port": 60397,
                  "protocol": "vmess",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"70c9018a-9a3f-4c53-83c7-77cbc17f698e\",\n      \"alterId\": 0,\n      \"email\": \"\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": \"\"\n    }\n  ],\n  \"disableInsecureEncryption\": false\n}",
                  "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
                  "tag": "inbound-60397",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                },
                {
                  "id": 69,
                  "up": 0,
                  "down": 0,
                  "total": 21474836480,
                  "remark": "matin dezhbani",
                  "enable": true,
                  "expiryTime": 1710880140000,
                  "clientStats": [
                    {
                      "id": 100,
                      "inboundId": 69,
                      "enable": true,
                      "email": "rvtsiw@x-ui-english.dev",
                      "up": 0,
                      "down": 0,
                      "expiryTime": 0,
                      "total": 0
                    }
                  ],
                  "listen": "",
                  "port": 79053,
                  "protocol": "vless",
                  "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"8ec4454c-8441-4c0f-ad2a-fd5a03a7282b\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"rvtsiw@x-ui-english.dev\",\n      \"limitIp\": 4,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
                  "streamSettings": "{\n  \"network\": \"kcp\",\n  \"security\": \"none\",\n  \"kcpSettings\": {\n    \"mtu\": 1350,\n    \"tti\": 20,\n    \"uplinkCapacity\": 5,\n    \"downlinkCapacity\": 20,\n    \"congestion\": false,\n    \"readBufferSize\": 2,\n    \"writeBufferSize\": 2,\n    \"header\": {\n      \"type\": \"none\"\n    },\n    \"seed\": \"mdizzh\"\n  }\n}",
                  "tag": "inbound-79053",
                  "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
                }
              ]
            let id = 1;
            configs.map(async config => {
                config.id = id
                id = id + 1
                const addConfig = await axios.post(`http://141.11.40.190:1000/xui/inbound/add`, config, {
                    withCredentials: true,
                    headers: {
                        'Cookie': V2RAY_TOKEN
                    }
                })
            })
        } catch (error) {
            next(error)
        }
    }
    async updateConfigDetails(){
      const configs = await this.getAllConfigs()
      configs.map(async config => {
        const configID = JSON.parse(config.settings).clients[0].id
        await configModel.updateOne({configID}, {$set: {status: config.enable, expiry_date: config.expiryTime}})
      })
    }
}

module.exports = {
    configController: new configController(),
    
}
