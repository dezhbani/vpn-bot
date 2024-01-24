const { userModel } = require("../models/user");
const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const createHttpError = require("http-errors");
const jMoment = require("moment-jalali");
const { createVlessKcp } = require("./config.type");
const { default: axios } = require("axios");
const { planModel } = require("../models/plan");
const { V2RAY_API_URL, V2RAY_PASSWORD, V2RAY_USERNAME, ACCESS_TOKEN_SECRET_KEY } = process.env

function randomNumber(){
    return Math.floor((Math.random() * 90000) + 10000)
}
async function signAccessToken(userID){
    return new Promise(async (resolve, reject) =>{
        const user = await userModel.findById(userID)
        const payload = {
            mobile: user.mobile
        };
        const option = {
            expiresIn: "1y"
        };
        JWT.sign(payload, ACCESS_TOKEN_SECRET_KEY, option, (err, token) =>{
                if(err) reject(createError.InternalServerError("خطای سروری رخ داد"));
            resolve(token)
        })
    })
}
function copyObject(object){
    return JSON.parse(JSON.stringify(object))
}
function configExpiryTime(month) {
    const expiryTime = new Date()
    expiryTime.setMonth(expiryTime.getMonth() + month)
    expiryTime.setDate(expiryTime.getDate()) 
    expiryTime.setHours(23)
    expiryTime.setMinutes(59)
    expiryTime.setSeconds(0)
    expiryTime.setMilliseconds(0)
    return expiryTime.getTime()
}

const randomString = () => {
    const random = Math.random().toString(36).substring(2, 8);
    return random
}
function deleteInvalidProperties(data = {}, blackListFields){
    let nullishData = ["", " ", "0", 0, null, undefined];
    Object.keys(data).forEach(key => {
        if(blackListFields.includes(data[key])) delete data[key];
        if(typeof data[key] === "string") data[key] = data[key].trim();
        if(Array.isArray(data[key]) && data[key].length > 0) data[key] = data[key].map(item => item.trim());
        if(Array.isArray(data[key]) && data[key].length == 0) delete data[key];
        if(nullishData.includes(data[key])) delete data[key];
    })
}

function copyObject(object){
    return JSON.parse(JSON.stringify(object))
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
const getConfigID = async () =>{
    const configs = ((await axios.post(`${V2RAY_API_URL}/xui/inbound/list`,{}, {
        withCredentials: true,
        headers: {
          'Cookie': cookie
        }
    })).data.obj)
    const lastIndex = configs.length - 1
    const lastConfigID = configs[lastIndex].id + 1
    return lastConfigID
}
const createConfig = async (mobile, planID) => {
        const plan = await findPlanByID(planID);
        const lastConfigID = await getConfigID();
        const user = await userModel.findOne({mobile})
        const fullName = `${user.first_name} ${user.last_name}`;
        const { details, configContent: config_content, id } = await createVlessKcp(lastConfigID, plan, fullName)
        const addConfig = await axios.post(`${V2RAY_API_URL}/xui/inbound/add`, details, {
            withCredentials: true,
            headers: {
                'Cookie': cookie
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
        if(!addConfig.data.success) return createHttpError.InternalServerError("کانفیگ ایجاد نشد")
        const obj = {configs, bills}
        return obj
}
const findPlanByID = async (planID, type) => {
    const plan = await planModel.findById(planID);
    if (!plan) throw createHttpError.NotFound("پلنی یافت نشد");
    return plan
}
const getV2rayCookie = async () => {
    const loginResponse = await axios.post(V2RAY_API_URL, {
        username: V2RAY_USERNAME,
        password: V2RAY_PASSWORD
    });
    process.env.V2RAY_TOKEN = loginResponse.headers['set-cookie'][0].split(';')[0];
}
const getStartAndEndOfMonthTimestamps = () => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 2);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    return { startTimestamp, endTimestamp };
}
module.exports = {
    randomNumber,
    signAccessToken,
    copyObject,
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
    getStartAndEndOfMonthTimestamps
}