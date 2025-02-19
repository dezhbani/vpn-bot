const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { Controllers } = require("../controller");
const { configModel } = require("../../models/config");
const { default: axios } = require("axios");
const { planModel } = require("../../models/plan");
const { copyObject, deleteInvalidProperties, configExpiryTime, covertGBtoBite, GbToBit } = require("../../utils/functions");
const { generateConfig, generateSubLink, createVlessTcp } = require("../../utils/config.type");
const { userModel } = require("../../models/user");
const { V2RAY_API_URL, V2RAY_TOKEN } = process.env
const { addConfigSchema } = require("../../validations/user/config.schema");
const { checkUserPaymentType } = require("../../utils/paymet.functions");
const { smsService } = require("../../services/sms.service");
const { configService } = require("../../services/config.service");

class UserConfigController extends Controllers {
    async buyConfig(req, res, next) {
        try {
            const user = req.user;
            const { planID } = await addConfigSchema.validateAsync(req.body);
            const plan = await this.findPlanByID(planID);
            const lastConfigID = await this.getConfigID();
            const fullName = `${user.first_name} ${user.last_name}`;
            const { details, configContent: config_content, id } = await createVlessTcp(lastConfigID, plan, fullName)
            const paymentType = await checkUserPaymentType('خرید کانفیگ', plan, user, id)
            if (paymentType) return res.status(StatusCodes.OK).json(paymentType);
            const addConfig = await configService.addConfig(details)
            // update user
            if (!addConfig.success) throw createHttpError.InternalServerError("کانفیگ ایجاد نشد")

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
    async repurchaseConfig(req, res, next) {
        try {
            const { full_name, mobile, _id: userID } = req.user
            const { configID } = req.body;
            const config = await configModel.findOne({ userID, configID })
            const configData = await configService.getConfig(configID)

            if (!config || !configData) throw createHttpError.NotFound("کانفیگ یافت نشد، لطفا با پشتیبانی تماس بگیرید")
            const plan = await planModel.findOne({ _id: config.planID })
            if (!plan) throw createHttpError.NotFound("پلن مورد نظر وجود ندارد یا حذف شده، لطفا با پشتیبانی تماس بگیرید")

            const data = {
                expiryTime: +configExpiryTime(plan.month),
                up: 0,
                down: 0,
                enable: true,
                total: covertGBtoBite(plan.data_size)
            }
            // check payment type
            const paymentType = await checkUserPaymentType('تمدید کانفیگ', plan, req.user, config.configID)
            if (paymentType) return res.status(StatusCodes.OK).json(paymentType);
            //update config data & time 
            const result = (await configService.updateConfig(data, config.configID)).success
            const updateConfig = await configModel.updateOne({ configID }, { $set: { expiry_date: +configExpiryTime(plan.month), endData: false } })
            if (!result || updateConfig.modifiedCount == 0) throw createHttpError.InternalServerError("کانفیگ تمدید نشد، در ضورت کسر وجه به پشتیبانی اطلاع دهید")
            await smsService.repurchaseMessage(mobile, full_name)
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: "کانفیگ تمدید شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async upgradeConfig(req, res, next) {
        try {
            const userID = req.user._id
            const { configID, planID } = req.body
            const config = await configModel.findOne({ configID })
            if (!config) throw createHttpError.NotFound("کانفیگ یافت نشد")
            const plan = await planModel.findById(planID)
            if (!plan) throw createHttpError.NotFound("پلن موردنظر یافت نشد")
            if (config.planID == planID) throw createHttpError.BadRequest("پلن انتخابی برای ارتقا، با پلن فعلی یکی میباشد")
            await this.checkUpperPlan(config.planID, planID)
            const user = await userModel.findOne({ _id: userID })
            if (!user) throw createHttpError.NotFound("کاربر یافت نشد")
            const oldPlan = await planModel.findOne({ _id: config.planID })
            if (!oldPlan) throw createHttpError.NotFound("پلن مورد نظر وجود ندارد یا حذف شده، لطفا با پشتیبانی تماس بگیرید")
            const paymentType = await checkUserPaymentType('ارتقا کانفیگ', plan, user, config.configID)
            if (paymentType) return res.status(StatusCodes.OK).json(paymentType);
            const data = {
                total: covertGBtoBite(plan.data_size)
            }
            // update config details (upgrade config)
            const result = await configService.updateConfig(data, configID)
            if (!result.success) throw createHttpError.InternalServerError("مشکلی در ارتقا کانفیگ رخ داد")

            const updateConfigResult = await configModel.updateOne({ configID }, { $set: { endData: false, planID } })
            if (updateConfigResult.modifiedCount == 0) throw createHttpError.InternalServerError("مشکلی در ارتقا کانفیگ به وجود امد")

            return res.status(StatusCodes.OK).json({
                message: "کانفیگ کاربر ارتقا یافت"
            })

        } catch (error) {
            next(error)
        }
    }
    async changeStatus(req, res, next) {
        try {
            const { configID } = req.body
            const userID = req.user._id
            const config = await configModel.findOne({ configID, userID })
            let configData = await configService.getConfig(configID)
            if (!configData || !config) throw createHttpError.NotFound("کانفیگ مورد نظر وجود ندارد")
            const result = await configService.updateConfig({ enable: !configData.enable }, configID)
            if (!result) throw createHttpError.InternalServerError("مشکلی در تغییر وضعیت کانفیگ به وجود آمد")
            // update config
            const updateResult = await configModel.updateOne({ configID }, { $set: { status: !configData.enable } })
            if (updateResult.modifiedCount == 0) throw createHttpError.InternalServerError("مشکلی در تغییر وضعیت کانفیگ به وجود آمد")
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: result.obj.enable ? 'کانفیگ فعال شد' : 'کانفیگ غیر فعال شد',
                configStatus: !configData.enable
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
                const configDetails = await configService.getConfig(config.configID);
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
            const configDetails = await configService.getConfig(config.configID)
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
            const config = await configModel.findOne({ userID, configID }, { configID: 1, planID: 1 })
            if (!configID || !config) throw createHttpError.BadRequest('کانفیگ موردنظر وجود ندارد')
            const plan = await planModel.findOne({ _id: config.planID })
            const user = await userModel.findOne({ _id: userID })
            const filteredBills = user.bills
                .filter(bill => bill.configID == configID)
                .sort((a, b) => b.buy_date - a.buy_date) // Sort by buy_date descending
                .slice(0, 5)
            const configDetails = await configService.getConfig(configID)
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
        else if (configDetails.total > 0 && ((configDetails.up + configDetails.down) >= configDetails.total)) configStatus = 'end-data'
        else if (!configDetails.enable) configStatus = 'inactive'
        else if (configDetails.enable) configStatus = 'active'
        return configStatus
    }
    async checkExistConfigs(configs) {
        try {
            const getConfigsResult = await configService.getConfigs()

            if (!getConfigsResult) throw createHttpError.NotFound("کانفیگی وجود ندارد")

            const configsArray = []
            getConfigsResult?.map(config2 => {
                configs.map(config => {
                    if (JSON.parse(config2.settings).clients[0].id == config.configID) configsArray.push({ config, data: config2 })
                })
            })
            return configsArray
        } catch (error) {
            throw error?.errors || error

        }
    }
    async checkUpperPlan(currentPlan, newPlan){
        try {
            const current = await planModel.findById(currentPlan)
            const upgradedPlan = await planModel.findById(newPlan)
            if ((upgradedPlan.price - current.price) < 0) throw createHttpError.Forbidden("پلن کانفیگ فقط قابل ارتقا به پلن های بالاتر است")
            return null
        } catch (error) {
            throw error
        }
    }
    async updateConfig(data, configID) {
        const configs = await configService.updateConfig(data, configID)
        return configs.data.obj.success
    }
    async getConfigID() {
        const configs = await configService.getConfigs()
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