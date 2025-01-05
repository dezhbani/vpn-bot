const { userModel } = require("../models/user");
const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const createHttpError = require("http-errors");
const jMoment = require("moment-jalali");
const { createVlessKcp } = require("./config.type");
const { default: axios } = require("axios");
const { planModel } = require("../models/plan");
const { configModel } = require("../models/config");
const { V2RAY_API_URL, V2RAY_PASSWORD, V2RAY_USERNAME, ACCESS_TOKEN_SECRET_KEY } = process.env

function randomNumber() {
    return Math.floor((Math.random() * 90000) + 10000)
}
async function signAccessToken(userID) {
    return new Promise(async (resolve, reject) => {
        const user = await userModel.findById(userID)
        const payload = {
            mobile: user.mobile
        };
        const option = {
            expiresIn: "1y"
        };
        JWT.sign(payload, ACCESS_TOKEN_SECRET_KEY, option, (err, token) => {
            if (err) reject(createError.InternalServerError("خطای سروری رخ داد"));
            resolve(token)
        })
    })
}
function copyObject(object) {
    return JSON.parse(JSON.stringify(object))
}
function configExpiryTime(month) {
    const expiryTime = new Date()
    expiryTime.setDate(expiryTime.getDate() + (month * 31))
    expiryTime.setHours(23)
    expiryTime.setMinutes(59)
    expiryTime.setSeconds(0)
    expiryTime.setMilliseconds(0)
    console.log(expiryTime.getDate(), expiryTime.getMonth(), expiryTime.getFullYear());
    
    return expiryTime.getTime()
}
const randomString = () => {
    const random = Math.random().toString(36).substring(2, 8);
    return random
}
function deleteInvalidProperties(data = {}, blackListFields) {
    let nullishData = ["", " ", "0", 0, null, undefined]
    Object.keys(data).forEach(key => {
        if (blackListFields.includes(key)) delete data[key]
        if (typeof data[key] == "string") data[key] = data[key].trim();
        if (Array.isArray(data[key]) && data[key].length > 0) data[key] = data[key].map(item => item.trim())
        if (Array.isArray(data[key]) && data[key].length == 0) delete data[key]
        if (nullishData.includes(data[key])) delete data[key];
    })

}
function stringifyProperties(data = {}, fields) {
    Object.keys(data).forEach(key => {
        if (!fields.includes(key)) return;

        // Check if the value is a valid JSON string
        if (data[key] && typeof data[key] === 'string') {
            try {
                const object = JSON.parse(data[key]);
                const formatted = JSON.stringify(object);
                
                // Assign the parsed object to data[key]
                data[key] = object;
                console.log("data", data);
            } catch (e) {
                console.error(`Error parsing JSON for key "${key}":`, e);
            }
        }
    });
}

const lastIndex = (array = []) => {
    const last = array.length - 1;
    return array[last]
}
const percentOfNumber = (number, percent) => {
    const result = (+number / 100) * percent;
    return result
}
const invoiceNumberGenerator = () => {
    return jMoment().format("jYYYYjMMjDDHHmmssSSS") + String(process.hrtime()[1]).padStart(9, 0)
}
const tomanToRial = (rial) => {
    return rial * 10
}
const rialToToman = (toman) => {
    return toman / 10
}
const getConfigID = async () => {
    const configs = ((await axios.post(`${V2RAY_API_URL}/xui/inbound/list`, {}, {
        withCredentials: true,
        headers: {
            'Cookie': process.env['V2RAY_TOKEN']
        }
    })).data.obj)
    const lastIndex = configs.length - 1
    const lastConfigID = configs[lastIndex].id + 1
    return lastConfigID
}
const createConfig = async (mobile, planID) => {
    const plan = await findPlanByID(planID);
    const lastConfigID = await getConfigID();
    const user = await userModel.findOne({ mobile })
    const fullName = `${user.first_name} ${user.last_name}`;
    const { details, configContent: config_content, id } = await createVlessKcp(lastConfigID, plan, fullName)
    const addConfig = await axios.post(`${V2RAY_API_URL}/xui/inbound/add`, details, {
        withCredentials: true,
        headers: {
            'Cookie': process.env['V2RAY_TOKEN']
        }
    })
    const configs = {
        name: fullName,
        config_content,
        expiry_date: +configExpiryTime(plan.month),
        configID: id,
        userID: user._id,
        planID
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
    if (!addConfig.data.success) return createHttpError.InternalServerError("کانفیگ ایجاد نشد")
    const obj = { configs, bills }
    return obj
}
const updateConfig = async (ID, data) => {
    const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/update/${ID}`, data, {
        withCredentials: true,
        headers: {
            'Cookie': process.env['V2RAY_TOKEN']
        }
    }))
    return configs.data.obj.success
}
const findConfigByID = async (configID) => {
    const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/list`, {}, {
        withCredentials: true,
        headers: {
            'Cookie': process.env['V2RAY_TOKEN']
        }
    })).data.obj
    const config = configs.filter(config => JSON.parse(config.settings).clients[0].id == configID);
    console.log(config, configID);
    if (!config) throw createHttpError.NotFound("کانفیگی یافت نشد");
    return config[0]
}

const upgradeConfig = async (userID, planID, configID, price) => {
    const user = await userModel.findOne(userID)
    if (!user) throw createHttpError.NotFound("کاربر یافت نشد")

    console.log(userID, configID);
    const config = await configModel.findOne({ userID, configID })
    if (!config) throw createHttpError.NotFound("کانفیگ یافت نشد، لطفا با پشتیبانی تماس بگیرید")
    console.log(config);

    const plan = await planModel.findOne({ _id: planID })
    if (!plan) throw createHttpError.NotFound("پلن مورد نظر وجود ندارد یا حذف شده، لطفا با پشتیبانی تماس بگیرید")

    let configsData = await findConfigByID(configID)
    if (!configsData) throw createHttpError.NotFound("کانفیگ یافت نشد، لطفا با پشتیبانی تماس بگیرید")

    configsData.expiryTime = +configExpiryTime(plan.month)
    configsData.total = GbToBit(plan.data_size)
    configsData.enable = true
    // update config details (upgrade config)
    const result = await updateConfig(configsData.id, configsData)

    const bills = {
        planID: plan._id,
        buy_date: new Date().getTime(),
        for: {
            description: 'ارتقا کانفیگ'
        },
        up: true,
        price
    }
    const updateWallet = await userModel.updateOne({ _id: userID }, { $push: { bills } })
    const updateConfigResult = await configModel.updateOne({ configID }, { $set: { endData: false, planID } })
    // update user 
    if (result || updateWallet.modifiedCount == 0 || updateConfigResult.modifiedCount == 0) throw createHttpError.InternalServerError("مشکلی در ارتقا کانفیگ به وجود امد")

    // await smsService.repurchaseMessage(user.mobile, user.full_name)
}
const GbToBit = GB => (+GB) * 1024 * 1024 * 1024
const findPlanByID = async (planID, type) => {
    const plan = await planModel.findById(planID);
    if (!plan) throw createHttpError.NotFound("پلنی یافت نشد");
    return plan
}
const getV2rayCookie = async () => {
    const loginResponse = await axios.post(`${V2RAY_API_URL}/login`, {
        username: V2RAY_USERNAME,
        password: V2RAY_PASSWORD
    });
    process.env['V2RAY_TOKEN'] = loginResponse.headers['set-cookie'][0].split(';')[0];
    console.log(process.env['V2RAY_TOKEN']);
}
const getStartAndEndOfMonthTimestamps = () => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 2);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    return { startTimestamp, endTimestamp };
}
const exportConfigDetails = config => {
    // console.log(JSON.parse(config.settings));
    // console.log(config.setting);
}
const covertGBtoBite = (GB) => {
    return (+GB) * 1024 * 1024 * 1024
}
module.exports = {
    randomNumber,
    signAccessToken,
    configExpiryTime,
    randomString,
    copyObject,
    deleteInvalidProperties,
    lastIndex,
    percentOfNumber,
    invoiceNumberGenerator,
    rialToToman,
    tomanToRial,
    createConfig,
    getV2rayCookie,
    getStartAndEndOfMonthTimestamps,
    exportConfigDetails,
    GbToBit,
    upgradeConfig,
    updateConfig,
    stringifyProperties,
    covertGBtoBite
}