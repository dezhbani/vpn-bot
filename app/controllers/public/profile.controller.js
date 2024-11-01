const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { Controllers } = require("../controller");

class profileController extends Controllers {
    async profile(req, res, next){
        try {
            const { first_name, last_name, full_name, mobile, wallet, role, _id } = req.user;
            // if(role == 'customer') throw createHttpError.Forbidden('شما به این قسمت دسترسی ندارید')
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                full_name,
                first_name,
                last_name,
                mobile, 
                role,
                wallet, 
                _id
            })
        } catch (error) {
            next(error)
        }
    }
    async bills(req, res, next){
        try {
            const { bills } = req.user;
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                bills
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = {
    profileController: new profileController()
}