const createHttpError = require("http-errors");
const { permissionModel } = require("../models/permission");
const { roleModel } = require("../models/role");

// function checkPermission(){
//     return async function(req, res, next){
//         try {
//             const url = req._parsedUrl.path;
//             const arrayOfUrl = url.split('/')
//             const LastIndex = lastIndex(arrayOfUrl)
//             const testID = mongoID.test(LastIndex);
//             const index = arrayOfUrl.indexOf(LastIndex)
//             if(testID) arrayOfUrl[index] = 'id';
//             const { first_name, last_name } = req.user;
//             const name = `${first_name} ${last_name}`
//             let role 
//             role = await roleModel.findOne({name});
//             if(!role) {
//                 const user = await userModel.findOne({first_name, last_name})
//                 role = await roleModel.findOne({name: user.role})
//             }
//             // if(!role) throw createHttpError.Forbidden('شما به این قسمت دسترسی ندارید')
//             const permissions = await permissionModel.find({_id: {$in: role.permissions}});
//             const permission = await permissionModel.findOne({main: arrayOfUrl[2], sub: arrayOfUrl[3]});
//             const userPermission = permissions.filter(p => p?._id.toString() == permission?._id.toString());
//             if (userPermission.length == 0) throw createHttpError.Forbidden('شما به این قسمت دسترسی ندارید');
//             return next()
//         } catch (error) {
//             next(error)
//         }
//     }
// }
function checkPermission(name){
    return async function(req, res, next){
        try {
            const { first_name, last_name, role } = req.user;
            const userFullName = `${first_name} ${last_name}`
            let userRole = await roleModel.findOne({userFullName})
            if(!userRole) userRole = await roleModel.findOne({name: role})
            if(!userRole) throw createHttpError.Forbidden('شما به این قسمت دسترسی ندارید')
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