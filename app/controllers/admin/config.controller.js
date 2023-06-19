const createHttpError = require("http-errors");
const { planModel } = require("../../models/plan");
const { StatusCodes } = require("http-status-codes");
const { deleteConfigSchema } = require("../../validations/admin/config.shema");
const { Controllers } = require("../controller");
const { configExpiryTime } = require("../../utils/functions");
const { V2RAY_API_URL, V2RAY_PANEL_TOKEN } = process.env
const { default: axios } = require('axios');
const { userModel } = require("../../models/user");
const { createVless } = require("../../utils/config.type");


class configController extends Controllers {
    async addConfig(req, res, next){
        try {
            const { first_name, last_name, mobile, planID } = req.body
            const plan = await this.findPlanByID(planID);
            const lastConfigID = await this.getConfigID();
            await this.createUser(first_name, last_name, mobile)
            const user = await userModel.findOne({mobile})
            const fullName = `${user.first_name} ${user.last_name}`;
            const { details, configContent: config_content, id } = await createVless(lastConfigID, plan, fullName)
            const addConfig = await axios.post(`${V2RAY_API_URL}/xui/inbound/add`, details, {
                withCredentials: true,
                headers: {
                    'Cookie': V2RAY_PANEL_TOKEN
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
                buy_date: new Date().getTime()
            }
            if(!addConfig.data.success) throw createHttpError.InternalServerError("کانفیگ ایجاد نشد")
            const saveResult = await userModel.updateOne({ mobile }, { $push: { configs, bills }})
            console.log(configs);
            if(saveResult.modifiedCount == 0) throw createHttpError("کانفیگ برای یوزر ذخیره نشد");
            return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.CREATED, 
                message: "کانفیگ ایجاد شد",
                configContent: config_content
            })
        } catch (error) {
            next(error)
        }
    }
    async deleteConfig(req, res, next){
        try {
            const { configID, userID } = await deleteConfigSchema.validateAsync(req.body);
            await this.findConfigByID(userID, configID);
            const result = await userModel.updateOne({ _id: userID }, { $pull: { config: {_id: configID} }});
            if (result.modifiedCount == 0) throw createHttpError.InternalServerError("کانفیگ حذف نشد")
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: "کانفیگ حذف شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async getAllConfigs(req, res, next){
        try {
            console.log(V2RAY_API_URL);
            const configs = (await axios.post(`${V2RAY_API_URL}/xui/inbound/list`, {}, {
                withCredentials: true,
                headers: {
                  'Cookie': V2RAY_PANEL_TOKEN
                }
            })).data.obj
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                configs
            })
        } catch (error) {
            next(error)
        }
    }
    async findPlanByID(planID) {
        const plan = await planModel.findOne({_id: planID});
        console.log(plan);
        if (!plan) throw createHttpError.NotFound("کانفیگی یافت نشد");
        return plan
    }
    async getConfigID(){
        const configs = ((await axios.post(`${V2RAY_API_URL}/xui/inbound/list`,{}, {
            withCredentials: true,
            headers: {
              'Cookie': V2RAY_PANEL_TOKEN
            }
        })).data.obj)
        const lastIndex = configs.length - 1
        const lastConfigID = configs[lastIndex].id + 1
        return lastConfigID
    }
    async createUser(first_name, last_name, mobile){
        const user = await userModel.findOne({mobile})
        if(!user){
            const newUser = await userModel.create({ first_name, last_name, mobile })
            if(!newUser) return createHttpError.InternalServerError('یوزر ثبت نشد')
        }
    }
}

module.exports = {
    configController: new configController()
}
