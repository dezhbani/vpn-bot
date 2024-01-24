const createHttpError = require("http-errors");
const { planModel } = require("../../models/plan");
const { StatusCodes } = require("http-status-codes");
const { deleteConfigSchema, addConfigSchema } = require("../../validations/admin/config.shema");
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


class configController extends Controllers {
    async buyConfig(req, res, next){
        try {
            const { payType, planID, full_name, first_name, last_name, mobile } = await addConfigSchema.validateAsync(req.body);
            const owner = req.user
            await this.createUser(full_name, first_name, last_name, mobile, owner._id)
            if(!(payType == 'مستقیم' || payType == 'اعتبار')) throw createHttpError.BadRequest("نوع پرداخت انتخاب شده صحیح نمی باشد");
            if(payType == 'مستقیم') {
                const plan = await planModel.findById(planID);
                
                // const {bills, ownerBills, configs} = await this.createConfig(req, res, next)
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
            console.log(error);
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
                configID: id
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
            if(updateWallet.modifiedCount == 0) throw createHttpError.InternalServerError('کانفیگ ثبت نشد')
            const saveResult = await userModel.updateOne({ mobile }, { $push: payType == 'اعتبار' ? {configs, bills} : { bills }})
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
            const list = await userModel.find({by: userID}, {configs: 1})
            list.map(user => {
                user.configs = user.configs.filter(config => config.expiry_date > new Date().getTime())
            })
            return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.OK, 
                configs: list
            })
        } catch (error) {
            next(error)
        }
    }
    async deleteConfig(req, res, next){
        try {
            const { configID, userID } = await deleteConfigSchema.validateAsync(req.body);
            await this.findConfigByID(userID, configID);
            const result = await userModel.updateOne({ _id: userID }, { $pull: { config: {_id: configID} }});
            if (result.modifiedCount == 0) throw createHttpError.InternalServerError("کانفیگ حذف نشد")
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
            let configsData = await this.findConfigByID(configID, 'configController')
            if (!configsData) throw createHttpError.NotFound("کانفیگ مورد نظر وجود ندارد")
            console.log(configsData.enable);
            configsData.enable = !configsData.enable;
            console.log(configsData.enable);
            const result = await this.updateConfig(configsData.id, configsData)
            console.log(result);
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
            const {userID} = req.params;
            const user = await userModel.findById(userID)
            if(!user) throw createHttpError.NotFound("کاربر یافت نشد")
            const config = user.configs.pop()
            const lastPlan = user.bills.pop()
            let configsData = await this.findConfigByID(config.configID, 'configController')
            const plan = await this.findPlanByID(lastPlan.planID.toString())
            configsData.expiryTime = +configExpiryTime(plan.month)
            configsData.up = 0
            configsData.down = 0
            configsData.enable = true
            const result = await this.updateConfig(configsData.id, configsData)
            const configs = {
                name: config.name,
                config_content: config.config_content,
                expiry_date: +configExpiryTime(plan.month), 
                configID: config.configID,
            }
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
                    description: 'تمدید کانفیگ',
                    user: user._id
                },
                up: true, 
                price: percentOfPlan
            }
            const wallet = owner.wallet - percentOfPlan;
            const updateWallet = await userModel.updateOne({ mobile: owner.mobile }, { $set: {wallet}, $push: {bills: ownerBills} })
            // update user 
            if(result || updateWallet.modifiedCount == 0) throw createHttpError.InternalServerError("کانفیگ تمدید نشد")
            const saveResult = await userModel.updateOne({ _id: userID }, { $push: { configs, bills }})
            if(saveResult.modifiedCount == 0) throw createHttpError("کانفیگ برای یوزر ذخیره نشد");
            if(result) throw createHttpError.InternalServerError("کانفیگ تمدید نشد")
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
            console.log(configs);
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
        const seed = JSON.parse(config[0].streamSettings).kcpSettings?.seed;
        const name = config[0].remark.replace(" ", "%20")
        const config_content = `vless://${configID}@s1.delta-dev.top:${config[0].port}?type=kcp&security=none&headerType=none&seed=${seed}#${name}`
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
        return configs.data.obj.success
    }
    async findPlanByID(planID) {
        console.log(planID);
        const plan = await planModel.findById(planID);
        if (!plan) throw createHttpError.NotFound("پلنی یافت نشد");
        return plan
    }
}

module.exports = {
    configController: new configController(),
    
}
