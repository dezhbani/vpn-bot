const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { Controllers } = require("../controller");
const { default: axios } = require("axios");
const { invoiceNumberGenerator, copyObject, lastIndex, tomanToRial, rialToToman, createConfig } = require("../../utils/functions");
const moment = require("moment-jalali");
const { PaymentModel } = require("../../models/payment");
const { userModel } = require("../../models/user");
const { userController } = require("./user.controller");
// const { configController, ConfigController } = require("../admin/config.controller");
const { ZARINPAL_MERCHANT_ID, CallbackURL, REDIRECT_URL, BASE_URL } = process.env;
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// const { amount, description } = req.body;
//             const zarinpal_request_url = "https://api.zarinpal.com/pg/v4/payment/request.json";
//             const zarinpalGatewayURL = "https://www.zarinpal.com/pg/StartPay"
//              const zapripal_options = {
//                  merchant_id: ZARINPAL_MERCHANT_ID,
//                  amount,
//                  currency: 'IRR',
//                  description ,
//                  callback_url: "http://localhost:80/verify"
//              }
//              const RequestResult = await axios.post(zarinpal_request_url, zapripal_options).then(result => result.data);
//              const {authority, code} = RequestResult.data
//              // const url = result.url
//              if(code == 100 && authority){
//                  return res.status(StatusCodes.OK).json({
//                      statusCode: StatusCodes.OK,
//                     gatewayURL: `${zarinpalGatewayURL}/${authority}`
//                 })
//             }
//             throw createHttpError.BadRequest("اتصال به درگاه پرداخت انجام نشد")

class paymentController extends Controllers {
    async createTransaction(req, res, next){
        try {
            const { amount, description, billID, user, callback } = req.body
            // console.log(user);
            const zarinpal_request_url = "https://api.zarinpal.com/pg/v4/payment/request.json";
            const zarinpalGatewayURL = "https://www.zarinpal.com/pg/StartPay"
            const zapripal_options = {
                merchant_id: ZARINPAL_MERCHANT_ID,
                amount,
                description: 'kkkkk' ,
                metadata:{
                    mobile: user.mobile
                },
                callback_url: callback || `${REDIRECT_URL}/payment/${billID}`
            }
            const RequestResult = await axios.post(zarinpal_request_url, zapripal_options)
            .then(result => result.data)
            .catch(err =>{
                console.error("error", err);
                return res.status(err.data.status).json({
                    message: err.data.message
                })
            })
            console.log(RequestResult);
            const {authority, code} = RequestResult.data;
            console.log(RequestResult.errors);
            await PaymentModel.create({
                invoiceNumber: invoiceNumberGenerator(),
                paymentDate: moment().format("jYYYYjMMjDDHHmmss"),
                amount,
                user: user._id,
                description,
                authority,
                verify: false

            })
            if(code == 100 && authority){
                return res.status(StatusCodes.OK).json({
                    code,
                    gatewayURL: `${zarinpalGatewayURL}/${authority}`
                })
            }
            // throw createHttpError.BadRequest("اتصال به درگاه پرداخت انجام نشد")
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
    async verifyTransaction(req, res, next){
        try {
            const { billID, authority } = req.params;
            console.log(authority);
            const verifyURL = "https://api.zarinpal.com/pg/v4/payment/verify.json";
            const payment = await PaymentModel.findOne({authority});
            if(!payment) throw createHttpError.NotFound("تراکنش در انتظار پرداخت یافت نشد")
            const verifyBody = JSON.stringify({
                authority,
                amount: payment.amount,
                merchant_id: process.env.ZARINPAL_MERCHANT_ID,
            })
            const verifyResult = await fetch(verifyURL, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: verifyBody
            }).then(result => result.json())
            // console.log(verifyResult.data.errors.validations);
            const bills = (await userModel.findOne(payment.user)).bills;
            const bill = bills.find(bill=> bill._id == billID);
            await PaymentModel.populate(bill, {
                path: 'paymentID',
                select: 'invoiceNumber verify amount'
            })
            if(verifyResult.data.code == 101) {
                return res.status(StatusCodes.OK).json({
                    code: 101,
                    message: "تراکنش قبلا پرداخت شده",
                    bill
                })
            }
            if(verifyResult.data.code == 100){
                await PaymentModel.updateOne({authority}, {
                    $set: {
                        refID: verifyResult.data.ref_id,
                        cardHash: verifyResult.data.card_hash,
                        verify: true
                    }
                })
                const { mobile } = await userModel.findById(payment.user)
                bill.paymentID = payment._id;
                let configResult;
                if(bill.planID && bill.up == null) {
                    configResult = await createConfig(mobile, bill.planID)
                    console.log(configResult);
                }else{
                    throw createHttpError.BadRequest("کانفیگ قبلا ثبت شده")
                }
                bill.up = true;
                // update user
                const { bills: userBills, configs } = configResult;
                const user = await userModel.updateOne({mobile}, {$set: {bills: userBills}, $push: {configs}});
                if(user.modifiedCount == 0) throw createHttpError.InternalServerError("کانفیگ برای یوزر ذخیره نشد")
                await userModel.updateOne({_id: payment.user}, {
                    $push: {
                        bills
                    }
                })
                return res.status(StatusCodes.OK).json({
                    code: 100,
                    message: "پرداخت شما با موفقیت انجام شد",
                    bill
                })
            }
            throw createHttpError.BadRequest("پرداخت انجام نشد در صورت کسر وجه طی ۷۲ ساعت به حساب شما بازمیگردد")
        } catch (error) {
            // console.log(error);
            next(error);
            next(createHttpError.InternalServerError("خطای داخلی سرور"))
        }
    }
    async verifyWalletTransaction(req, res, next){
        try {
            const { billID, authority } = req.params;
            const verifyURL = "https://api.zarinpal.com/pg/v4/payment/verify.json";
            const payment = await PaymentModel.findOne({authority});
            if(!payment) throw createHttpError.NotFound("تراکنش در انتظار پرداخت یافت نشد")
            const verifyBody = JSON.stringify({
                authority,
                amount: payment.amount,
                merchant_id: process.env.ZARINPAL_MERCHANT_ID,
            })
            const verifyResult = await fetch(verifyURL, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: verifyBody
            }).then(result => result.json())
            const bills = (await userModel.findById(payment.user))?.bills;
            const payments = await PaymentModel.populate(bills, {path: "paymentID"})
            console.log(verifyResult);
            if(!bills) throw createHttpError.NotFound("تراکنشی یافت نشد")
            const bill = bills.find(bill => bill._id == billID );
            console.log(bill)
            if(!bill) throw createHttpError.NotFound("تراکنشی یافت نشد")
            if(verifyResult.data.code == 101) {
                return res.status(StatusCodes.OK).json({
                    code: 101,
                    message: "تراکنش قبلا پرداخت شده",
                    bill
                })
            }
            if(verifyResult.data.code == 100){
                const user = await userModel.findById(payment.user);
                const wallet = user.wallet + rialToToman(+payment.amount);
                const walletResult = await userModel.updateOne({ _id: payment.user }, { $set: { wallet }});
                if (walletResult.modifiedCount == 0) throw createHttpError.InternalServerError("پول به کیف پول کاربر اصافه نشد");
                await PaymentModel.updateOne({authority}, {
                    $set: {
                        refID: verifyResult.data.ref_id,
                        cardHash: verifyResult.data.card_hash,
                        verify: true
                    }
                })
                
                bill.paymentID = payment._id;
                bill.up = false;
                await userModel.updateOne({_id: payment.user}, {
                    $set: {
                        bills
                    }
                })
                const payments = await PaymentModel.populate(bills, {path: "paymentID"})
                return res.status(StatusCodes.OK).json({
                    code: 100,
                    message: "پرداخت شما با موفقیت انجام شد",
                    bill: lastIndex(payments)
                })
            }
            throw createHttpError.BadRequest("پرداخت انجام نشد در صورت کسر وجه طی ۷۲ ساعت به حساب شما بازمیگردد")
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
    async paymentTransaction(description, pay, userID, owner){
        const bills = {
            buy_date: new Date().getTime(),
            for: {
                description,
                user: userID
            },
            price: pay,
            up: null
        }
        const billsResult = await userModel.updateOne({ _id: userID }, { $push: { bills }});
        let billID;
        if (billsResult.modifiedCount !== 0) {
            const bills = (await userModel.findById(userID)).bills;
            const lastBill = lastIndex(bills);
            billID = lastBill._id;
        };
        const ownerDetails = await userModel.findById(owner)
        const createPayLink = await axios.post(`${BASE_URL}/payment/create`, {
            amount: tomanToRial(pay),
            billID,
            description,
            user: ownerDetails,
            callback: `${REDIRECT_URL}/wallet/${billID}`
        })
        return createPayLink
    }
}

module.exports = {
    paymentController: new paymentController()
}