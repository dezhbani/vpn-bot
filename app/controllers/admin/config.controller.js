const createHttpError = require("http-errors");
const { planModel } = require("../../models/plan");
const { StatusCodes } = require("http-status-codes");
const { deleteConfigSchema, repurchaseConfigSchema, addConfigSchema } = require("../../validations/admin/config.shema");
const { Controllers } = require("../controller");
const { percentOfNumber, lastIndex, configExpiryTime, copyObject, exportConfigDetails } = require("../../utils/functions");
const { V2RAY_API_URL, V2RAY_TOKEN, REDIRECT_URL } = process.env
const { default: axios } = require('axios');
const { userModel } = require("../../models/user");
const { createVlessKcp } = require("../../utils/config.type");
const { smsService } = require("../../services/sms.service");
const { configModel } = require("../../models/config");
const { paymentController } = require("./payment/payment.controller");


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
            const list = adminAllConfigs
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
        // this.replaceAllConfigs()
        // const jsonData = JSON.stringify(configs, null, 2);
        // fs.writeFile('./data.json', jsonData, (err) => {
        //     if (err) {
        //         console.error('Error writing file', err);
        //     } else {
        //         console.log('File has been written successfully');
        //     }
        // });
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
    async replaceAllConfigs(){
        // try {
        //     // fs.readFile('./data.json', 'utf8', (err, data) => {
        //     //     if (err) {
        //     //       console.error('Error reading file', err);
        //     //       return;
        //     //     }
        //     //     // console.log(data);
        //     // })
        //     let configs
        //     const data = [
        //         {
        //             "id": 1,
        //           "up": 366565530,
        //           "down": 14017166870,
        //           "total": 53687091200,
        //           "remark": "mahsa mashhadifam",
        //           "enable": true,
        //           "expiryTime": 0,
        //           "clientStats": [
        //             {
        //               "id": 2,
        //               "inboundId": 1,
        //               "enable": true,
        //               "email": "rsff54@x-ui-english.dev",
        //               "up": 11158220431,
        //               "down": 204671907368,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 22918,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"d27a61a0-f087-4958-bf52-7119b06ff857\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"rsff54@x-ui-english.dev\",\n      \"limitIp\": \"0\",\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"speedtest.net\"\n          ],\n          \"Referer\": [\n            \"snapp.ir\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        //           "tag": "inbound-22918",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 2,
        //           "up": 710675595,
        //           "down": 30453150937,
        //           "total": 107374182400,
        //           "remark": "sadra ganbarnezhad",
        //           "enable": true,
        //           "expiryTime": 1718051340000,
        //           "clientStats": [
        //             {
        //               "id": 4,
        //               "inboundId": 2,
        //               "enable": true,
        //               "email": "uih458@x-ui-english.dev",
        //               "up": 11698196084,
        //               "down": 441096689565,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 43207,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"b0dd04d6-1f17-45bc-9d71-9420ae234a3e\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"uih458@x-ui-english.dev\",\n      \"limitIp\": \"4\",\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {\n      \"Host\": \"speedtest.net\"\n    }\n  }\n}",
        //           "tag": "inbound-43207",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 3,
        //           "up": 1110019209,
        //           "down": 24777456198,
        //           "total": 64424509440,
        //           "remark": "navid dezhbani",
        //           "enable": true,
        //           "expiryTime": 1718310540000,
        //           "clientStats": [
        //             {
        //               "id": 5,
        //               "inboundId": 3,
        //               "enable": true,
        //               "email": "sclbd4@x-ui-english.dev",
        //               "up": 17696276943,
        //               "down": 465174961902,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 31873,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"cd9af49a-97b9-4caa-8254-c28c9ac07c4c\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"sclbd4@x-ui-english.dev\",\n      \"limitIp\": 2,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
        //           "tag": "inbound-31873",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 4,
        //           "up": 337771068,
        //           "down": 9279830862,
        //           "total": 64424509440,
        //           "remark": "reza mashhadifam",
        //           "enable": true,
        //           "expiryTime": 1718915340000,
        //           "clientStats": [
        //             {
        //               "id": 6,
        //               "inboundId": 4,
        //               "enable": true,
        //               "email": "eqj5i2@x-ui-english.dev",
        //               "up": 3272333968,
        //               "down": 90495260503,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 15220,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"c28d59fa-f295-4924-8796-c81b4bfced7e\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"eqj5i2@x-ui-english.dev\",\n      \"limitIp\": \"2\",\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
        //           "tag": "inbound-15220",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 5,
        //           "up": 1273645975,
        //           "down": 41147369350,
        //           "total": 42949672960,
        //           "remark": "reza dezhbani",
        //           "enable": true,
        //           "expiryTime": 1717792140000,
        //           "clientStats": [
        //             {
        //               "id": 12,
        //               "inboundId": 5,
        //               "enable": true,
        //               "email": "nxlcu0@x-ui-english.dev",
        //               "up": 10673647575,
        //               "down": 306888463086,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 48980,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"cfa594a5-5b78-47e7-909a-5fea400c1052\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"nxlcu0@x-ui-english.dev\",\n      \"limitIp\": \"2\",\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"speedtest.net\"\n          ],\n          \"Referer\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        //           "tag": "inbound-48980",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 7,
        //           "up": 4284479487,
        //           "down": 138335378404,
        //           "total": 0,
        //           "remark": "Parivash",
        //           "enable": true,
        //           "expiryTime": 0,
        //           "clientStats": [],
        //           "listen": "",
        //           "port": 14525,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"f5190fd7-1504-4191-8af2-f368b435ff42\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": \"\"\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"speedtest.net\",\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        //           "tag": "inbound-14525",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 8,
        //           "up": 426404009,
        //           "down": 3833765712,
        //           "total": 64424509440,
        //           "remark": "mohammad ghorbani",
        //           "enable": true,
        //           "expiryTime": 1719520140000,
        //           "clientStats": [
        //             {
        //               "id": 13,
        //               "inboundId": 8,
        //               "enable": true,
        //               "email": "s781rg@x-ui-english.dev",
        //               "up": 51197678929,
        //               "down": 488145327850,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 23824,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"d67bd1e9-1687-4767-b3ac-b6b0c871083f\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"s781rg@x-ui-english.dev\",\n      \"limitIp\": \"0\",\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
        //           "tag": "inbound-23824",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 9,
        //           "up": 660838912,
        //           "down": 15612957832,
        //           "total": 21474836480,
        //           "remark": "matin dezhbani2",
        //           "enable": true,
        //           "expiryTime": 0,
        //           "clientStats": [
        //             {
        //               "id": 37,
        //               "inboundId": 9,
        //               "enable": true,
        //               "email": "p8zpaf@x-ui-english.dev",
        //               "up": 651699463,
        //               "down": 15701566173,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 13616,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"981eeb33-ea09-4174-9159-372caa9d7539\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"p8zpaf@x-ui-english.dev\",\n      \"limitIp\": 4,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
        //           "tag": "inbound-13616",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 10,
        //           "up": 1999658033,
        //           "down": 71053344763,
        //           "total": 107374182400,
        //           "remark": "azam ganbarnezhad",
        //           "enable": true,
        //           "expiryTime": 0,
        //           "clientStats": [
        //             {
        //               "id": 43,
        //               "inboundId": 10,
        //               "enable": false,
        //               "email": "67qtwx@x-ui-english.dev",
        //               "up": 0,
        //               "down": 0,
        //               "expiryTime": 1702240140000,
        //               "total": 107374182400
        //             },
        //             {
        //               "id": 44,
        //               "inboundId": 10,
        //               "enable": true,
        //               "email": "b6c9dh@x-ui-english.dev",
        //               "up": 1933895406,
        //               "down": 70261687050,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 49243,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"ee341032-6e97-4a0c-9cf9-5a74913bbc77\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"b6c9dh@x-ui-english.dev\",\n      \"limitIp\": 4,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {\n      \"Host\": \"google.com\"\n    }\n  }\n}",
        //           "tag": "inbound-49243",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 11,
        //           "up": 1698284377,
        //           "down": 18610120012,
        //           "total": 42949672960,
        //           "remark": "paria nasiri",
        //           "enable": true,
        //           "expiryTime": 1718051340000,
        //           "clientStats": [
        //             {
        //               "id": 89,
        //               "inboundId": 11,
        //               "enable": true,
        //               "email": "95lkxi@x-ui-english.dev",
        //               "up": 13737823666,
        //               "down": 125074782704,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 49717,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"b1759f98-75ec-444c-abed-8b7dafad3651\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"95lkxi@x-ui-english.dev\",\n      \"limitIp\": 2,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
        //           "tag": "inbound-49717",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 12,
        //           "up": 240175026,
        //           "down": 12555522377,
        //           "total": 48318382080,
        //           "remark": "parsa pashazade",
        //           "enable": false,
        //           "expiryTime": 0,
        //           "clientStats": [
        //             {
        //               "id": 95,
        //               "inboundId": 12,
        //               "enable": false,
        //               "email": "szk6x9@x-ui-english.dev",
        //               "up": 0,
        //               "down": 0,
        //               "expiryTime": 1707164940000,
        //               "total": 21474836480
        //             },
        //             {
        //               "id": 97,
        //               "inboundId": 12,
        //               "enable": true,
        //               "email": "hp8ous@x-ui-english.dev",
        //               "up": 2492331474,
        //               "down": 65206117178,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 19922,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"45f425e8-6b8d-42a2-a8f1-9225a9abfe17\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"hp8ous@x-ui-english.dev\",\n      \"limitIp\": 2,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"kcp\",\n  \"security\": \"none\",\n  \"kcpSettings\": {\n    \"mtu\": 1350,\n    \"tti\": 20,\n    \"uplinkCapacity\": 5,\n    \"downlinkCapacity\": 20,\n    \"congestion\": false,\n    \"readBufferSize\": 2,\n    \"writeBufferSize\": 2,\n    \"header\": {\n      \"type\": \"none\"\n    },\n    \"seed\": \"uegt5p\"\n  }\n}",
        //           "tag": "inbound-19922",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 13,
        //           "up": 172192941,
        //           "down": 6207063522,
        //           "total": 0,
        //           "remark": "laptop2",
        //           "enable": true,
        //           "expiryTime": 0,
        //           "clientStats": [
        //             {
        //               "id": 99,
        //               "inboundId": 13,
        //               "enable": false,
        //               "email": "ssjjzf@x-ui-english.dev",
        //               "up": 0,
        //               "down": 0,
        //               "expiryTime": 1707769740000,
        //               "total": 21474836480
        //             },
        //             {
        //               "id": 113,
        //               "inboundId": 13,
        //               "enable": true,
        //               "email": "",
        //               "up": 0,
        //               "down": 0,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 60397,
        //           "protocol": "vmess",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"70c9018a-9a3f-4c53-83c7-77cbc17f698e\",\n      \"alterId\": 0,\n      \"email\": \"\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": \"\"\n    }\n  ],\n  \"disableInsecureEncryption\": false\n}",
        //           "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
        //           "tag": "inbound-60397",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 15,
        //           "up": 33880184,
        //           "down": 3179302590,
        //           "total": 21474836480,
        //           "remark": "parham eslahi",
        //           "enable": true,
        //           "expiryTime": 1717792140000,
        //           "clientStats": [
        //             {
        //               "id": 105,
        //               "inboundId": 15,
        //               "enable": true,
        //               "email": "2n89h4@x-ui-english.dev",
        //               "up": 196667056,
        //               "down": 7194088276,
        //               "expiryTime": 0,
        //               "total": 21474836480
        //             }
        //           ],
        //           "listen": "",
        //           "port": 63169,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"caccc436-147b-4b9a-b40a-1e3f6194eaeb\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"2n89h4@x-ui-english.dev\",\n      \"limitIp\": 2,\n      \"totalGB\": 21474836480,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {\n      \"Host\": \"speedtest.net\"\n    }\n  }\n}",
        //           "tag": "inbound-63169",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 16,
        //           "up": 11898778,
        //           "down": 482616893,
        //           "total": 0,
        //           "remark": "sss",
        //           "enable": true,
        //           "expiryTime": 0,
        //           "clientStats": [
        //             {
        //               "id": 107,
        //               "inboundId": 16,
        //               "enable": false,
        //               "email": "b3x1f1@x-ui-english.dev",
        //               "up": 0,
        //               "down": 0,
        //               "expiryTime": 1711571340000,
        //               "total": 21474836480
        //             }
        //           ],
        //           "listen": "",
        //           "port": 18571,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"f72b0104-b06f-4c53-9521-0fb908501a0a\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": \"\"\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"grpc\",\n  \"security\": \"none\",\n  \"grpcSettings\": {\n    \"serviceName\": \"cdn.discordapp.com\"\n  }\n}",
        //           "tag": "inbound-18571",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 17,
        //           "up": 1574781,
        //           "down": 44073683,
        //           "total": 21474836480,
        //           "remark": "matin dezhbani",
        //           "enable": true,
        //           "expiryTime": 0,
        //           "clientStats": [
        //             {
        //               "id": 108,
        //               "inboundId": 17,
        //               "enable": false,
        //               "email": "kjek99@x-ui-english.dev",
        //               "up": 0,
        //               "down": 0,
        //               "expiryTime": 1711571340000,
        //               "total": 21474836480
        //             },
        //             {
        //               "id": 109,
        //               "inboundId": 17,
        //               "enable": true,
        //               "email": "88eo07@x-ui-english.dev",
        //               "up": 0,
        //               "down": 0,
        //               "expiryTime": 0,
        //               "total": 21474836480
        //             },
        //             {
        //               "id": 114,
        //               "inboundId": 17,
        //               "enable": true,
        //               "email": "zo25gynh@x-ui-english.dev",
        //               "up": 1557347,
        //               "down": 44016703,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 45675,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"45f425e8-6b8d-42a2-a8f1-9225a9abfe17\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"zo25gynh@x-ui-english.dev\",\n      \"limitIp\": 1,\n      \"totalGB\": 0,\n      \"expiryTime\": \"\"\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"kcp\",\n  \"security\": \"none\",\n  \"kcpSettings\": {\n    \"mtu\": 1350,\n    \"tti\": 20,\n    \"uplinkCapacity\": 5,\n    \"downlinkCapacity\": 20,\n    \"congestion\": false,\n    \"readBufferSize\": 2,\n    \"writeBufferSize\": 2,\n    \"header\": {\n      \"type\": \"none\"\n    },\n    \"seed\": \"fgozrw\"\n  }\n}",
        //           "tag": "inbound-45675",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 18,
        //           "up": 389221936,
        //           "down": 15787764106,
        //           "total": 21474836480,
        //           "remark": "mehri azimi",
        //           "enable": false,
        //           "expiryTime": 1718742540000,
        //           "clientStats": [
        //             {
        //               "id": 110,
        //               "inboundId": 18,
        //               "enable": true,
        //               "email": "gt154y@x-ui-english.dev",
        //               "up": 0,
        //               "down": 0,
        //               "expiryTime": 0,
        //               "total": 21474836480
        //             },
        //             {
        //               "id": 111,
        //               "inboundId": 18,
        //               "enable": true,
        //               "email": "6r2bcp@x-ui-english.dev",
        //               "up": 0,
        //               "down": 0,
        //               "expiryTime": 0,
        //               "total": 0
        //             },
        //             {
        //               "id": 112,
        //               "inboundId": 18,
        //               "enable": true,
        //               "email": "4h5chp@x-ui-english.dev",
        //               "up": 162120966,
        //               "down": 1348209119,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 25927,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"a0c64768-619e-4cf2-90ae-cc8a23f69222\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"4h5chp@x-ui-english.dev\",\n      \"limitIp\": 2,\n      \"totalGB\": 0,\n      \"expiryTime\": 0\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"speedtest.net\"\n          ],\n          \"Referer\": [\n            \"digikala.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        //           "tag": "inbound-25927",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 20,
        //           "up": 23605778,
        //           "down": 287525911,
        //           "total": 21474836480,
        //           "remark": "mehri azimi",
        //           "enable": false,
        //           "expiryTime": 1718742540695,
        //           "clientStats": [],
        //           "listen": "",
        //           "port": 46879,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"433e6082-5ac8-41dd-8013-d3f667dd927b\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"\",\n      \"limitIp\": 0,\n      \"totalGB\": 0,\n      \"expiryTime\": \"\"\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"ws\",\n  \"security\": \"none\",\n  \"wsSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"path\": \"/\",\n    \"headers\": {}\n  }\n}",
        //           "tag": "inbound-46879",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         },
        //         {
        //           "id": 21,
        //           "up": 39694383,
        //           "down": 3165891209,
        //           "total": 42949672960,
        //           "remark": "vahid dezhbani",
        //           "enable": true,
        //           "expiryTime": 1719752773112,
        //           "clientStats": [
        //             {
        //               "id": 116,
        //               "inboundId": 21,
        //               "enable": true,
        //               "email": "29tmm9@x-ui-english.dev",
        //               "up": 0,
        //               "down": 0,
        //               "expiryTime": 0,
        //               "total": 0
        //             },
        //             {
        //               "id": 117,
        //               "inboundId": 21,
        //               "enable": true,
        //               "email": "bcmav6@x-ui-english.dev",
        //               "up": 39177287,
        //               "down": 3172301407,
        //               "expiryTime": 0,
        //               "total": 0
        //             }
        //           ],
        //           "listen": "",
        //           "port": 54814,
        //           "protocol": "vless",
        //           "settings": "{\n  \"clients\": [\n    {\n      \"id\": \"43ae3d11-0a2e-42ea-81e8-f8ee7b7a1d32\",\n      \"flow\": \"xtls-rprx-direct\",\n      \"email\": \"bcmav6@x-ui-english.dev\",\n      \"limitIp\": 2,\n      \"totalGB\": 0,\n      \"expiryTime\": \"\"\n    }\n  ],\n  \"decryption\": \"none\",\n  \"fallbacks\": []\n}",
        //           "streamSettings": "{\n  \"network\": \"tcp\",\n  \"security\": \"none\",\n  \"tcpSettings\": {\n    \"acceptProxyProtocol\": false,\n    \"header\": {\n      \"type\": \"http\",\n      \"request\": {\n        \"method\": \"GET\",\n        \"path\": [\n          \"/\"\n        ],\n        \"headers\": {\n          \"Host\": [\n            \"speedtest.net\"\n          ],\n          \"Referer\": [\n            \"google.com\"\n          ]\n        }\n      },\n      \"response\": {\n        \"version\": \"1.1\",\n        \"status\": \"200\",\n        \"reason\": \"OK\",\n        \"headers\": {}\n      }\n    }\n  }\n}",
        //           "tag": "inbound-54814",
        //           "sniffing": "{\n  \"enabled\": true,\n  \"destOverride\": [\n    \"http\",\n    \"tls\"\n  ]\n}"
        //         }
        //       ]
        //     configs = JSON.parse(data)
        //       let id = 3;
        //     configs.map(async config => {
        //         // console.log(config);
        //         console.log(details);
        //         id = id + 1
        //         config.id = id
        //         // const addConfig = await axios.post(`http://fr.delta-dev.top:1000/xui/inbound/add`, details, {
        //         //     withCredentials: true,
        //         //     headers: {
        //         //         'Cookie': "MTcxNzEzNjg5MXxEdi1CQkFFQ180SUFBUkFCRUFBQVpmLUNBQUVHYzNSeWFXNW5EQXdBQ2t4UFIwbE9YMVZUUlZJWWVDMTFhUzlrWVhSaFltRnpaUzl0YjJSbGJDNVZjMlZ5XzRNREFRRUVWWE5sY2dIX2hBQUJBd0VDU1dRQkJBQUJDRlZ6WlhKdVlXMWxBUXdBQVFoUVlYTnpkMjl5WkFFTUFBQUFKZi1FSWdFQ0FRNXRZWFJwYmkxa1pYcG9ZbUZ1YVFFTlRVRlVTVTVrWlhwb1ltRnVhUUE9fL6OLfWZpxfT9S_yYKAuTOi2q4OZYgcIYmppAso7yO5Z"
        //         //     }
        //         // })
        //         console.log(addConfig);
        //     })
        // } catch (error) {
        //     console.log(error)
        // }
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
