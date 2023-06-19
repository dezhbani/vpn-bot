const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { Controllers } = require("../controller");
const { userModel } = require("../../models/user");
const { addUserSchema } = require("../../validations/admin/user.schema");
const { IDvalidator } = require("../../validations/public.schema");
const { planModel } = require("../../models/plan");
const { default: axios } = require("axios");
const { V2RAY_API_URL, V2RAY_PANEL_TOKEN } = process.env

class userController extends Controllers {
    async addUser(req, res, next){
        try {
            const { first_name, last_name, mobile } = await addUserSchema.validateAsync(req.body);
            await this.findUserByMobile(mobile);
            const createUserResult = await userModel.create({first_name, last_name, mobile})
            if(!createUserResult) createHttpError.InternalServerError("کاربر ثبت نشد")
            return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.CREATED, 
                message: "کاربر اضافه شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async addUserDetails(req, res, next){
        try {
            const { planID, buy_date, configID, userID } = req.body;
            console.log( planID, buy_date, configID, userID );
            await this.findUserByID(userID)
            await this.findPlanByID(planID);
            const { name, expiry_date, config_content } = await this.findConfigByID(configID);
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
            const updateResult = await userModel.updateOne({ _id: userID }, { $push: {
                bills: data.bills,
                configs: data.configs
            } });
            console.log(updateResult);
            if (updateResult.modifiedCount == 0) throw createHttpError.InternalServerError("اطلاعات کاربر آپدیت نشد");
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: "اطلاعات کاربر آپدیت شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async getAllUsers(req, res, next){
        try {
            const users = await userModel.find()
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                users
            })
        } catch (error) {
            next(error)
        }
    }
    async findUserByMobile(mobile) {
        const user = await planModel.findOne({mobile});
        if (user) throw createHttpError.BadRequest("کاربر قبلا ثبت شده");
        return user
    }
    async findUserByID(userID) {
        const user = await userModel.findById(userID);
        if (!user) throw createHttpError.NotFound("کاربر یافت نشد");
        return user
    }
    async findPlanByID(planID) {
        const { id } = await IDvalidator.validateAsync({ id: planID });
        const plan = await planModel.findById(id);
        if (!plan) throw createHttpError.NotFound("پلنی یافت نشد");
        return plan
    }
    async findConfigByID(configID) {
        const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/list`, {}, {
            withCredentials: true,
            headers: {
              'Cookie': V2RAY_PANEL_TOKEN
            }
        })).data.obj
        const config = configs.filter(config => JSON.parse(config.settings).clients[0].id == configID);
        console.log(config.streamSettings);
        const seed = JSON.parse(config[0].streamSettings).kcpSettings.seed;
        const name = config[0].remark.replace(" ", "%20")
        const config_content = `vless://${configID}@s1.delta-dev.top:${config[0].port}?type=kcp&security=none&headerType=none&seed=${seed}#${name}`
        console.log(config_content);
        if (!config) throw createHttpError.NotFound("کانفیگی یافت نشد");
        return {
            name: config[0].remark,
            expiry_date: config[0].expiryTime,
            config_content
        }
    }
}

module.exports = {
    userController: new userController()
}