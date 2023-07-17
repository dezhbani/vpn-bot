const createHttpError = require("http-errors");
const { permissionModel } = require("../models/permission");
const { roleModel } = require("../models/role");
const { mongoID } = require("../validations/public.schema");
const { lastIndex } = require("../utils/functions");

function checkPermission(){
    return async function(req, res, next){
        try {
            const url = req._parsedUrl.path;
            const arrayOfUrl = url.split('/')
            const LastIndex = lastIndex(arrayOfUrl)
            const testID = mongoID.test(LastIndex);
            const index = arrayOfUrl.indexOf(LastIndex)
            if(testID) arrayOfUrl[index] = 'id';
            const { first_name, last_name } = req.user;
            const name = `${first_name} ${last_name}`
            const role = await roleModel.findOne({name});
            if(!role) throw createHttpError.Forbidden('شما به این قسمت دسترسی ندارید')
            const permissions = await permissionModel.find({_id: {$in: role.permissions}});
            const permission = await permissionModel.findOne({main: arrayOfUrl[2], sub: arrayOfUrl[3]});
            const userPermission = permissions.filter(p => p?._id.toString() == permission?._id.toString());
            if (userPermission.length == 0) throw createHttpError.Forbidden('شما به این قسمت دسترسی ندارید');
            return next()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = {
    checkPermission
}