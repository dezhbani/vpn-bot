const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { Controllers } = require("../controller");
const { configModel } = require("../../models/config");
const { default: axios } = require("axios");
const { planModel } = require("../../models/plan");
const { copyObject, deleteInvalidProperties } = require("../../utils/functions");
const { generateConfig, generateSubLink } = require("../../utils/config.type");
const { V2RAY_API_URL, V2RAY_TOKEN } = process.env

class UserConfigController extends Controllers {
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
}

module.exports = {
    UserConfigController: new UserConfigController()
}