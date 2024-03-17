const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { Controllers } = require("../controller");
const { userModel } = require("../../models/user");
const { addUserSchema } = require("../../validations/admin/user.schema");
const { IDvalidator } = require("../../validations/public.schema");
const { planModel } = require("../../models/plan");
const { configController } = require("./config.controller");
const { copyObject, lastIndex } = require("../../utils/functions");
const { smsService } = require("../../services/sms.service");
// const { paymentController } = require("./payment.controller");
const { PaymentModel } = require("../../models/payment");
const { paymentTransaction } = require("./payment/payment");
const { paymentController } = require("./payment/payment.controller");


class userController extends Controllers {
    async addUser(req, res, next) {
        try {
            const { first_name, last_name, mobile } = await addUserSchema.validateAsync(req.body);
            await this.findUserByMobile(mobile);
            const createUserResult = await userModel.create({ first_name, last_name, mobile })
            if (!createUserResult) createHttpError.InternalServerError("کاربر ثبت نشد")
            return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.CREATED,
                message: "کاربر اضافه شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async updateWallet(req, res, next) {
        try {
            const owner = req.user;
            const { id } = req.params;
            const { pay } = req.body;
            if(!pay) throw createHttpError.BadRequest("مبلغ نمیتواند خالی باشد")
            const createPayLink = await paymentController.paymentTransaction("افزایش اعتبار", pay, owner, id)
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                payLink: createPayLink.gatewayURL
            })
        } catch (error) {
            next(error)
        }
    }
    async editUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await this.findUserByID(id);
            const data = copyObject(req.body);
            const updateResult = await userModel.updateOne({ _id: user.id }, { $set: data });
            if (updateResult.modifiedCount == 0) throw createHttpError.InternalServerError("اطلاعات یوزر آپدیت نشد");
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: "اطلاعات یوزر آپدیت شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async addUserDetails(req, res, next) {
        try {
            const { planID, buy_date, configID, userID } = req.body;
            await this.findUserByID(userID)
            await this.findPlanByID(planID);
            const { name, expiry_date, config_content } = await configController.findConfigByID(configID);
            const data = {
                bills: [],
                configs: []
            }
            const config = {
                name,
                expiry_date,
                configID,
                config_content
            }
            const bill = {
                planID,
                buy_date
            }
            data.configs.push(config);
            data.bills.push(bill);
            const updateResult = await userModel.updateOne({ _id: userID }, {
                $push: {
                    bills: data.bills,
                    configs: data.configs
                }
            });
            if (updateResult.modifiedCount == 0) throw createHttpError.InternalServerError("اطلاعات کاربر آپدیت نشد");
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: "اطلاعات کاربر آپدیت شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const { _id: ownerID } = req.user
            const users = await userModel.find({by: ownerID}, { otp: 0 })
            const account = await planModel.populate(users, {
                path: 'bills.planID'
            })
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                users: account.length? account: null
            })
        } catch (error) {
            next(error)
        }
    }
    async getUsersByOwner(req, res, next) {
        try {
            const user = req.user
            const users = await userModel.find({by: user._id}, { otp: 0 })
            const account = await planModel.populate(users, {
                path: 'bills.planID'
            })
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                users: account
            })
        } catch (error) {
            next(error)
        }
    }
    async getUserByID(req, res, next) {
        try {
            const { id } = req.params;
            const user = await this.findUserByID(id);
            const userDetails = await planModel.populate(user, {
                path: 'bills.planID'
            })
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                user: userDetails
            })
        } catch (error) {
            next(error)
        }
    }
    async getBillByID(req, res, next) {
        try {
            const { billID } = req.params;
            const { _id: id } = req.user;
            const user = await this.findUserByID(id);
            const bill = user.bills.find(bill=> JSON.stringify(bill._id) == JSON.stringify(billID));
            let billDetails;
            if(bill.planID) {
                billDetails = await planModel.populate(bill, {
                    path: 'planID'
                })
            }
            if(bill.paymentID) {
                billDetails = await PaymentModel.populate(bill, {
                    path: 'paymentID',
                    select: 'invoiceNumber verify amount'
                })
            }
            if(bill.for.user) {
                billDetails = await userModel.populate(bill, {
                    path: 'for.user',
                    select: 'full_name mobile'
                })
            }
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                bill: billDetails
            })
        } catch (error) {
            next(error)
        }
    }
    async resendConfig(req, res, next) {
        try {
            const { userID } = req.body;
            const user = await userModel.findById(userID);
            const configContent = user.configs.filter(config => config._id == configID)
            await smsService.resendConfig(user.mobile, configContent)
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: 'کانفیگ دوباره ارسال شد'
            })
        } catch (error) {
            next(error)
        }
    }
    async findUserByMobile(mobile) {
        const user = await userModel.findOne({ mobile });
        if (user) throw createHttpError.BadRequest("کاربر قبلا ثبت شده");
        return user
    }
    async findUserByID(userID) {
        const user = await userModel.findById(userID, { otp: 0 });
        if (!user) throw createHttpError.NotFound("کاربر یافت نشد");
        return user
    }
    async findPlanByID(planID) {
        const { id } = await IDvalidator.validateAsync({ id: planID });
        const plan = await planModel.findById(id);
        if (!plan) throw createHttpError.NotFound("پلنی یافت نشد");
        return plan
    }

}

module.exports = {
    userController: new userController()
}