const { userModel } = require("../models/user");
const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const createHttpError = require("http-errors");
const { ACCESS_TOKEN_SECRET_KEY } = process.env;
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
function configExpiryTime(month){
    const expiryTime = new Date()
    expiryTime.setMonth(expiryTime.getMonth() + month)
    expiryTime.setDate(expiryTime.getDate())
    expiryTime.setHours(23)
    expiryTime.setMinutes(59)
    expiryTime.setSeconds(0)
    expiryTime.setMilliseconds(0)
    return expiryTime.getTime()
}

function randomString(){
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
module.exports = {
    randomNumber,
    signAccessToken,
    copyObject,
    configExpiryTime,
    randomString,
    copyObject,
    deleteInvalidProperties,
    lastIndex,
    percentOfNumber
}