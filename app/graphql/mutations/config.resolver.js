const { default: axios } = require("axios");
const { configModel } = require("../../models/config");
const { planModel } = require("../../models/plan");
const { responseType } = require("../typeDefs/public.type");
const { checkPaymentType } = require("../utils/paymet.functions");
const { createVlessTcp } = require("../../utils/config.type");
const createHttpError = require("http-errors");
const { checkToken } = require("../queries/public.resolver");
const { GraphQLString } = require("graphql");
const { userModel } = require("../../models/user");
const { configExpiryTime } = require("../../utils/functions");
const { toString } = require("../utils/functions");
const { smsService } = require("../../services/sms.service");
const { V2RAY_API_URL, V2RAY_TOKEN } = process.env

const buyConfig = {
    type: responseType,
    args: {
        planID: {type: GraphQLString}
    },
    resolve: async (_, args, context) => {
        const {_id: userID} = await checkToken(context);
        const { planID } = args
        const plan = await planModel.findById(planID);
        if (!plan) throw createHttpError.NotFound("پلن مورد نظر وجود ندارد")
        const paymentType = await checkPaymentType("خرید کانفیگ", plan.price, userID)
        if(paymentType) return {statusCode: 200, data: paymentType }
        const result = addConfig(userID, plan)
        return result
    }
}
const repurchaseConfig = {
    type: responseType,
    args: {
        configID: {type: GraphQLString}
    },
    resolve: async (_, args, context) => {
        const {_id: userID, mobile, full_name} = await checkToken(context);
        const { configID } = args
        const config = await configModel.findOne({configID});
        if (!config) throw createHttpError.NotFound("کانفیگ مورد نظر وجود ندارد، لطفا با پشتیبانی تماس بگیرید")
            console.log(JSON.stringify(config.userID) == JSON.stringify(userID));
        if (toString(config.userID) != toString(userID)) throw createHttpError.Forbidden("این کانفیگ متعلق به شما نیست")
        const plan = await planModel.findOne({_id: config.planID})
        if (!plan) throw createHttpError.NotFound("پلن مورد نظر وجود ندارد یا حذف شده")
        let configsData = await findConfigByID(configID)
        if(!configsData) throw createHttpError.NotFound("کانفیگ یافت نشد، لطفا با پشتیبانی تماس بگیرید")
        configsData.expiryTime = +configExpiryTime(plan.month)
        configsData.up = 0
        configsData.down = 0
        configsData.enable = true
        const paymentType = await checkPaymentType("تمدید کانفیگ", plan.price, userID)
        if(paymentType) return {statusCode: 200, data: paymentType }
        const configResult = await updateConfig(configsData.id, configsData)
        const updateUserConfig = await configModel.updateOne({ configID }, { $set: {expiry_date: +configExpiryTime(plan.month), endData: false}})
            // update user 
        if(configResult || updateUserConfig.modifiedCount == 0) throw createHttpError.InternalServerError("کانفیگ تمدید نشد")
        await smsService.repurchaseMessage(mobile, full_name)
        return {
            statusCode: 200, 
            data: {
                message: "کانفیگ تمدید شد"
            }
        }
    }
}

const findConfigByID = async (configID) => {
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

const addConfig = async (userID, plan) => {
    try {
        const user = await userModel.findOne({_id: userID})
        if(user.wallet < plan.price) throw createHttpError.BadRequest("موجودی حساب شما کافی نمی باشد")
        const lastConfigID = await getConfigID();
        const fullName = `${ user.first_name} ${user.last_name}`;
        const { details, configContent: config_content, id } = await createVlessTcp(lastConfigID, plan, fullName)
        await axios.post(`${V2RAY_API_URL}/xui/inbound/add`, details, {
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
        // update user 
        const createResult = await configModel.create(configs)
        if(!createResult) throw createHttpError.InternalServerError('کانفیگ ثبت نشد')
        return {
            statusCode: 201, 
            data: {
                message: "کانفیگ ایجاد شد",
                configContent: config_content
            }
        }
    } catch (error) {
        throw createHttpError.InternalServerError(error.message)
    }
}
const updateConfig = async (configID, data) => {
    const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/update/${configID}`, data, {
        withCredentials: true,
        headers: {
          'Cookie': V2RAY_TOKEN
        }
    }))
    return configs.data.obj.success
}
const getConfigID = async () => {
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

module.exports = {
    buyConfig,
    repurchaseConfig
}