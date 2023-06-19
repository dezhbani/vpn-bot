const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { Controllers } = require("../controller");
const { userModel } = require("../../models/user");
const { addUserSchema } = require("../../validations/admin/user.schema");

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
}

module.exports = {
    userController: new userController()
}