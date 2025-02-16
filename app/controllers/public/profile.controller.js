const createHttpError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const { Controllers } = require("../controller");
const { userModel } = require("../../models/user");

class profileController extends Controllers {
    async profile(req, res, next) {
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
    async bills(req, res, next) {
        try {
            const { _id } = req.user;
            const { page = 1, limit = 50 } = req.query;
    
            // محاسبه skip برای pagination
            const skip = (+page - 1) * +limit;
    
            // Aggregation Pipeline
            const user = await userModel.aggregate([
                { $match: { _id } },
                {
                    $project: {
                        bills: {
                            $slice: [
                                { $sortArray: { input: "$bills", sortBy: { buy_date: -1 } } },
                                skip,
                                +limit
                            ]
                        },
                        totalBills: { $size: "$bills" }
                    }
                }
            ]);
    
            if (!user || user.length === 0) {
                return res.status(StatusCodes.OK).json({
                    bills: [],
                    currentPage: page,
                    totalPages: 0,
                    totalItems: 0
                });
            }
    
            const [userData] = user;
            const totalItems = userData.totalBills;
            const totalPages = Math.ceil(totalItems / limit);
    
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                bills: userData.bills,
                currentPage: page,
                totalPages,
                totalItems
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = {
    profileController: new profileController()
}