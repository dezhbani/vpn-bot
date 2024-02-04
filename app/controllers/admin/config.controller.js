const createHttpError = require("http-errors");
const { planModel } = require("../../models/plan");
const { StatusCodes } = require("http-status-codes");
const { deleteConfigSchema, addConfigSchema, repurchaseConfigSchema } = require("../../validations/admin/config.shema");
const { Controllers } = require("../controller");
const { percentOfNumber, lastIndex, configExpiryTime, cookie } = require("../../utils/functions");
const { V2RAY_API_URL, V2RAY_TOKEN, REDIRECT_URL } = process.env
const { default: axios } = require('axios');
const { userModel } = require("../../models/user");
const { createVlessKcp } = require("../../utils/config.type");
const { IDvalidator } = require("../../validations/public.schema");
const { smsService } = require("../../services/sms.service");
const autoBind = require("auto-bind");
const paymentController = require("./payment.controller");
const user = require("../../models/user");
const { configModel } = require("../../models/config");


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
                const transactionResult = await paymentController.paymentController.createTransaction(req, res, next)
                return transactionResult
            }
            if(payType == 'اعتبار') return this.addConfig(req, res, next);
        } catch (error) {
        }
    }
    async addConfig(req, res, next){
        try {
            const owner = req.user
            const { full_name, first_name, last_name, mobile, planID, payType } = req.body;
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
            console.log(updateWallet);
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
            const configs = await configModel.find()
            let list = await userModel.populate(configs, {
                path: 'userID',
                select: "by -_id"
            })
            list = list.filter(config => config.userID && +config.expiry_date > new Date().getTime() && `${config.userID.by}` == userID)
            return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.OK, 
                configs: list
            })
        } catch (error) {
            next(error)
        }
    }
    
    async getAllEndedTime(req, res, next){
        try {
            const { _id: ownerID } = req.user;
            let list = [];
            let alertDay = 2;
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
                    if(daysUntilTime == alertDay && month == nowMonth && year == nowYear && config.status ) {
                        const user = await userModel.findOne({by: ownerID, _id: config.userID});
                        if(!user) throw createHttpError.Forbidden("این کاربر توسط شما ثبت نشده،شما نمیتوانید اطلاعات آن را ببینید")
                        const { mobile, first_name, last_name, full_name, chatID, _id: userID } = user;
                        const { expiry_date, _id: configID } = config;
                        list.push({mobile, first_name, last_name, full_name, userID, expiry_date, configID, chatID, untilEndTime: daysUntilTime - 1})
                    }
                })
            )
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                config: list
            })
        } catch (error) {
            next(error)
        }
    }
    async getUserActiveConfigs(req, res, next){
        try {
            const { _id: ownerID } = req.user;
            const { userID } = req.params;
            const configs = await configModel.find({userID})
            let list = await userModel.populate(configs, {
                path: 'userID',
                select: "by -_id"
            })
            list = list.filter(config => config.status && !(config.expiry_date < new Date().getTime()) && config.userID.by == `${ownerID}`)
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                configs: list
            })
        } catch (error) {
            next(error)
        }
    }
    async deleteConfig(req, res, next){
        try {
            const { configID } = req.body
            const findV2rayConfig = await this.findConfigByID(configID)
            const config = await configModel.findOne({configID})
            console.log(config);
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
            // update user 
            if(result) throw createHttpError.InternalServerError("مشکلی در تغییر وضعیت کانفیگ به وجود آمد")
            await smsService.repurchaseMessage(user.mobile, user.full_name)
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                message: configsData.enable? 'کانفیگ روشن شد': 'کانفیگ خاموش شد'
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
    }
    async findConfigByID(configID, type) {
        const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/list`, {}, {
            withCredentials: true,
            headers: {
              'Cookie': V2RAY_TOKEN
            }
        })).data.obj
        const config = configs.filter(config => JSON.parse(config.settings).clients[0].id == configID);
        // const seed = JSON.parse(config[0].streamSettings).kcpSettings?.seed;
        // const name = config[0].remark.replace(" ", "%20")
        // const config_content = `vless://${configID}@s1.delta-dev.top:${config[0].port}?type=kcp&security=none&headerType=none&seed=${seed}#${name}`
        if (!config) throw createHttpError.NotFound("کانفیگی یافت نشد");
        if(type == 'userController'){
            return {
                name: config[0].remark,
                expiry_date: config[0].expiryTime,
                config_content
            }
        }else{
            return config[0]
        }
    }
    async updateConfig(configID, data) {
        const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/update/${configID}`, data, {
            withCredentials: true,
            headers: {
              'Cookie': V2RAY_TOKEN
            }
        }))
        console.log(configs.data);
        return configs.data.obj.success
    }
    async findPlanByID(planID) {
        const plan = await planModel.findById(planID);
        if (!plan) throw createHttpError.NotFound("پلنی یافت نشد");
        return plan
    }
}

module.exports = {
    configController: new configController(),
    
}
