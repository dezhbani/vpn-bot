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
    buyConfig
}