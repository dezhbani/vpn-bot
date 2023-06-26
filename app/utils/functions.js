const { userModel } = require("../models/user");
const JWT = require("jsonwebtoken");
const createError = require("http-errors");
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
            expiresIn: "1m"
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
    expiryTime.setDate(expiryTime.getDate() +1)
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

module.exports = {
    randomNumber,
    signAccessToken,
    copyObject,
    configExpiryTime,
    randomString
}