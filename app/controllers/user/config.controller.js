const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { Controllers } = require("../controller");
const { configModel } = require("../../models/config");
const { default: axios } = require("axios");
const { planModel } = require("../../models/plan");
const { copyObject, deleteInvalidProperties, configExpiryTime } = require("../../utils/functions");
const { generateConfig, generateSubLink, createVlessTcp } = require("../../utils/config.type");
const { userModel } = require("../../models/user");
const { V2RAY_API_URL, V2RAY_TOKEN } = process.env
const fs = require('fs');
const { addConfigSchema } = require("../../validations/user/config.schema");
const { checkUserPaymentType } = require("../../utils/paymet.functions");

class UserConfigController extends Controllers {
    async buyConfig(req, res, next) {
        try {
            const user = req.user;
            const { planID } = await addConfigSchema.validateAsync(req.body);
            const plan = await this.findPlanByID(planID);
            if (user.wallet < plan.price) {
                const paymentType = await checkUserPaymentType('خرید کانفیگ', (plan.price - user.wallet), user, null)
                if (paymentType) return res.status(StatusCodes.OK).json(paymentType);
            }
            const lastConfigID = await this.getConfigID();
            const fullName = `${user.first_name} ${user.last_name}`;
            const { details, configContent: config_content, id } = await createVlessTcp(lastConfigID, plan, fullName)
            const addConfig = await axios.post(`${V2RAY_API_URL}/xui/inbound/add`, details, {
                withCredentials: true,
                headers: {
                    'Cookie': V2RAY_TOKEN
                }
            })
            // update user
            if (!addConfig.data.success) throw createHttpError.InternalServerError("کانفیگ ایجاد نشد")
                
            const configs = {
                name: fullName,
                config_content,
                expiry_date: +configExpiryTime(plan.month), 
                configID: id,
                userID: user._id,
                planID: plan._id
            }
            const createResult = await configModel.create(configs)
            if (!createResult) throw createHttpError.InternalServerError('کانفیگ ثبت نشد')
            // const saveResult = await userModel.updateOne({ mobile: user.mobile }, { $push: { bills } })
            // if (saveResult.modifiedCount == 0) throw createHttpError("کانفیگ برای یوزر ذخیره نشد");
            return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.CREATED,
                message: "کانفیگ ایجاد شد",
                configContent: config_content
            })
        } catch (error) {
            next(error)
        }
    }
    async getConfigs(req, res, next) {
        try {
            const userID = req.user._id;
            const configs = await configModel.find({ userID }, { configID: 1, name: 1 })
            const configsResult = await this.checkExistConfigs(configs)
            const allConfig = configsResult.map(({ config }) => config)
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                configs: allConfig || null
            })
        } catch (error) {
            next(error)
        }
    }
    async getAllConfigs(req, res, next) {
        try {
            const userID = req.user._id;
            const findConfigs = await configModel.find({ userID });
            const configsResult = await this.checkExistConfigs(findConfigs);
            const configs = await Promise.all(configsResult.map(async ({ config, data }) => {
                const configDetails = await this.findConfigByID(config.configID);
                const configCopy = copyObject(config);
                configCopy.status = await this.checkConfigStatus(configDetails);
                deleteInvalidProperties(configCopy, ['createdAt', 'updatedAt', 'endData']);
                configCopy.data = configDetails;
                configCopy.port = config.config_content.split(':')[2].split('?')[0];
                configCopy.config_content = generateConfig(data);
                configCopy.subscriptionLink = generateSubLink(config.configID);
                return configCopy;
            }));
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                configs
            });
        } catch (error) {
            next(error);
        }
    }
    async getConfigDetailsByID(req, res, next) {
        try {
            const userID = req.user._id;
            const { configID } = req.params;
            if (!configID) throw createHttpError.BadRequest('کانفیگ وارد شده صحیح نمی باشد')
            const config = await configModel.findOne({ userID, configID }, { configID: 1, planID: 1 })
            const plan = await planModel.findOne({ _id: config.planID })
            const configDetails = await this.findConfigByID(config.configID)
            // configDetails.status = 'expired'
            configDetails.status = await this.checkConfigStatus(configDetails)
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                config: configDetails,
                plan
            })
        } catch (error) {
            next(error)
        }
    }
    async getConfigByID(req, res, next) {
        try {
            const userID = req.user._id;
            const { configID } = req.params;
            if (!configID) throw createHttpError.BadRequest('کانفیگ وارد شده صحیح نمی باشد')
            const config = await configModel.findOne({ userID, configID }, { configID: 1, planID: 1 })
            const plan = await planModel.findOne({ _id: config.planID })
            const user = await userModel.findOne({ _id: userID })
            const filteredBills = user.bills
                .filter(bill =>
                    (
                        bill.for.description === "تمدید کانفیگ" ||
                        bill.for.description === "خرید کانفیگ"
                    ) && bill.configID == configID
                )
                .sort((a, b) => b.buy_date - a.buy_date) // Sort by buy_date descending
                .slice(0, 5)
            const configDetails = await this.findConfigByID(config.configID)
            configDetails.status = await this.checkConfigStatus(configDetails)
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                config: configDetails,
                plan,
                bills: filteredBills
            })
        } catch (error) {
            next(error)
        }
    }
    async configSubscription(req, res, next) {
        try {
            const { configID } = req.params;
            const checkExitConfig = await configModel.findOne({ configID }, { configID: 1 })
            if (!checkExitConfig) throw createHttpError.NotFound("کانفیگ یافت نشد")
            const findConfig = await this.checkExistConfigs([checkExitConfig])
            let configContent = ""
            findConfig.map(config => configContent = configContent + `${generateConfig(config.data)}\n`)
            return res.send(configContent)
        } catch (error) {
            next(error)
        }
    }
    async checkConfigStatus(configDetails) {
        const now = new Date().getTime()
        let configStatus = 'unknown'
        if (configDetails.expiry < now) configStatus = 'expired'
        else if ((configDetails.up + configDetails.down) >= configDetails.total) configStatus = 'end-data'
        else if (!configDetails.enable) configStatus = 'inactive'
        else if (configDetails.enable) configStatus = 'active'
        return configStatus
    }
    async checkExistConfigs(configs) {
        const getConfigsResult = (await axios.post(`${V2RAY_API_URL}/xui/inbound/list`, {}, {
            withCredentials: true,
            headers: {
                'Cookie': V2RAY_TOKEN
            }
        })).data.obj
        const configsArray = []
        getConfigsResult.map(config2 => {
            configs.map(config => {


                if (JSON.parse(config2.settings).clients[0].id == config.configID) configsArray.push({ config, data: config2 })
            })
        })
        return configsArray
    }
    async findConfigByID(configID) {
        const getConfigsResult = (await axios.post(`${V2RAY_API_URL}/xui/inbound/list`, {}, {
            withCredentials: true,
            headers: {
                'Cookie': V2RAY_TOKEN
            }
        })).data.obj
        const config = getConfigsResult.find(config => JSON.parse(config.settings).clients[0].id == configID)
        const configDetail = {
            up: config.up,
            down: config.down,
            total: config.total,
            expiry: config.expiryTime,
            enable: config.enable
        }
        return configDetail
    }
    async getConfigID() {
        const configs = ((await axios.post(`${V2RAY_API_URL}/xui/inbound/list`, {}, {
            withCredentials: true,
            headers: {
                'Cookie': V2RAY_TOKEN
            }
        })).data.obj)
        const lastIndex = configs.length - 1
        const lastConfigID = configs[lastIndex].id + 1
        return lastConfigID
    }
    async findPlanByID(planID) {
        const plan = await planModel.findById(planID);
        if (!plan) throw createHttpError.NotFound("پلنی یافت نشد");
        return plan
    }
}

module.exports = {
    UserConfigController: new UserConfigController()
}