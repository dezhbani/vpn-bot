const createHttpError = require("http-errors");
const { permissionModel } = require("../models/permission");
const { roleModel } = require("../models/role");

function checkPermission(name){
    return async function(req, res, next){
        try {
            const { first_name, last_name, role } = req.user;
            const roleName = role.split(',')    
            const userFullName = `${first_name} ${last_name}`
            let userRole = await roleModel.findOne({userFullName})
            if(!userRole) userRole = await roleModel.findOne({name: {$in: roleName}})
            if(!userRole) throw createHttpError.Forbidden('شما به این قسمت دسترسی ندرید')
            const permissions = await permissionModel.find({_id: {$in: userRole.permissions}});
            const checkUserAccess = permissions.find(permission => permission.name == name)
            if(!checkUserAccess) throw createHttpError.Forbidden('شما به این قسمت دسترسی ندارید')
            return next()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = {
    checkPermission
}