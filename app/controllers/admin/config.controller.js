const createHttpError = require("http-errors");
const { planModel } = require("../../models/plan");
const { StatusCodes } = require("http-status-codes");
const { deleteConfigSchema, addConfigSchema } = require("../../validations/admin/config.shema");
const { Controllers } = require("../controller");
const { percentOfNumber, configExpiryTime, copyObject, upgradeConfig } = require("../../utils/functions");
const { V2RAY_API_URL, V2RAY_TOKEN } = process.env
const { default: axios } = require('axios');
const { userModel } = require("../../models/user");
const { createVlessTcp } = require("../../utils/config.type");
const { smsService } = require("../../services/sms.service");
const { configModel } = require("../../models/config");
const { checkPaymentType } = require("../../utils/paymet.functions");
const fs = require("fs")

class configController extends Controllers {
    async buyConfig(req, res, next){
        try {
            const { planID, full_name, first_name, last_name, mobile } = await addConfigSchema.validateAsync(req.body);
            const owner = req.user
            const user = await this.createUser(full_name, first_name, last_name, mobile, owner._id)
            const plan = await planModel.findById(planID);
            if (!plan) throw createHttpError.NotFound("پلن مورد نظر وجود ندارد")
            const percentOfPlan = percentOfNumber(plan.price, 70);
            const paymentType = await checkPaymentType('ارتقا کانفیگ کاربر', percentOfPlan, owner._id, user._id)
            if(paymentType) return res.status(StatusCodes.OK).json(paymentType);
            return this.addConfig(req, res, next);
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
            const fullName = `${ user.first_name} ${user.last_name}`;
            const { details, configContent: config_content, id } = await createVlessTcp(lastConfigID, plan, fullName)
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
    async upgradeConfig(req, res, next){
        try {
            const { _id: ownerID } = req.user;
            const { configID, planID } = req.body;
            const config = await configModel.findOne({configID})
            if(!config) throw createHttpError.NotFound("کانفیگ یافت نشد")
            if(config.planID == planID) throw createHttpError.BadRequest("پلن انتخابی برای ارتقا، با پلن فعلی یکی میباشد")
            const user = await userModel.findById(config.userID)
            if(!user) throw createHttpError.NotFound("کاربر یافت نشد")
            console.log(user.by == ownerID);
            if(JSON.stringify(user.by) != JSON.stringify(ownerID)) throw createHttpError.Forbidden("این کاربر توسط ادمین دیگری ثبت شده")
            const oldPlan = await planModel.findOne({_id: config.planID})
            if (!oldPlan) throw createHttpError.NotFound("پلن مورد نظر وجود ندارد یا حذف شده، لطفا با پشتیبانی تماس بگیرید")
            const newPlan = await planModel.findOne({_id: planID})
            if (!newPlan) throw createHttpError.NotFound("پلن مورد نظر وجود ندارد")
            const price = percentOfNumber(newPlan.price - oldPlan.price, 70)
            const paymentType = await checkPaymentType('ارتقا کانفیگ کاربر', price, ownerID, config.userID)
            if(paymentType) return res.status(StatusCodes.OK).json(paymentType);
            await upgradeConfig(user._id, planID, configID, newPlan.price - oldPlan.price)
            return res.status(StatusCodes.OK).json({
                message: "کانفیگ کاربر ارتقا یافت"
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
            const { userID, configID } = await req.body;
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
            const percentOfPlan = percentOfNumber(plan.price, 70)
            if(owner.wallet < percentOfPlan) throw createHttpError.BadRequest("موجودی حساب شما کافی نمی باشد")
            const result = await this.updateConfig(configsData.id, configsData)
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
        const arr = [26, 27,28,29,30,31,32,33,34,35];
        // arr.map( async value => {
        //     const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/del/${value}`, {}, {
        //         withCredentials: true,
        //         headers: {
        //             'Cookie': V2RAY_TOKEN
        //         }
        //     })).data
        // })
    }
    async getAllConfigs(){
        const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/list`, {}, {
            withCredentials: true,
            headers: {
                'Cookie': V2RAY_TOKEN
            }
        })).data.obj
        this.replaceAllConfigs()
        const jsonData = JSON.stringify(configs, null, 2);
        fs.writeFile('./data.json', jsonData, (err) => {
            if (err) {
                console.error('Error writing file', err);
            } else {
                console.log('File has been written successfully');
            }
        });
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
        if(user){
            if(!(JSON.stringify(user.by) == JSON.stringify(by))) throw createHttpError.Forbidden("این کاربر توسط ادمین دیگری ثبت شده")
            return user
        }else{
            const newUser = await userModel.create({ full_name, first_name, last_name, mobile, by })
            if(!newUser) return createHttpError.InternalServerError('یوزر ثبت نشد')
            return newUser
        }
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
        //     configs = JSON.parse(data)
              let id = 3;
            data.map(async config => {
                // console.log(config);
                // console.log(details);
                id = id + 1
                config.id = id
                const addConfig = await axios.post(`http://s1.delta-dev.top:1000/xui/inbound/add`, config, {
                    withCredentials: true,
                    headers: {
                        'Cookie': "session=MTcyMTk0MDE4OHxEdi1CQkFFQ180SUFBUkFCRUFBQVpmLUNBQUVHYzNSeWFXNW5EQXdBQ2t4UFIwbE9YMVZUUlZJWWVDMTFhUzlrWVhSaFltRnpaUzl0YjJSbGJDNVZjMlZ5XzRNREFRRUVWWE5sY2dIX2hBQUJBd0VDU1dRQkJBQUJDRlZ6WlhKdVlXMWxBUXdBQVFoUVlYTnpkMjl5WkFFTUFBQUFKZi1FSWdFQ0FRNXRZWFJwYmkxa1pYcG9ZbUZ1YVFFTlRVRlVTVTVrWlhwb1ltRnVhUUE9fBSNDp3Q-rra6X3ee2pRJsuBh4OuGGI0HoyFHexs2f6z"
                    }
                })
                console.log(addConfig);
            })
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
