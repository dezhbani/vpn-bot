const createHttpError = require("http-errors");
const { StatusCodes: httpStatus } = require("http-status-codes");
const { default: mongoose } = require("mongoose");
const { copyObject, deleteInvalidProperties } = require("../../../utils/functions");
const { addRoleSchema } = require("../../../validations/admin/RBAC.schema");
const { Controllers } = require("../../controller");
const { roleModel } = require("../../../models/role");
const { permissionModel } = require("../../../models/permission");

class RoleController extends Controllers{
    async addRole(req, res, next){
        try {
            // const {name, permissions, description} = await addRoleSchema.validateAsync(req.body);
            const {name, permissions, description} = req.body;
            await this.findRoleByname(name);
            const createRole = await roleModel.create({name, permissions, description});
            if(!createRole) throw createHttpError.InternalServerError("نقش ایجاد نشد");
            return res.status(httpStatus.CREATED).json({
                statusCode: httpStatus.CREATED,
                data: {
                    message: "نقش با موفقیت ایجاد شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async getAllRole(req, res, next){
        try {
            const roles = await roleModel.find({});
            return res.status(httpStatus.OK).json({
                statusCode: httpStatus.OK,
                 roles
            })
        } catch (error) {
            next(error)
        }
    }
    async editRole(req, res, next){
        try {
            const { id } = req.params;
            const role = await this.findRoleByIdOrname(id);
            const data = copyObject(req.body);
            const permissionResult = await this.findPermissionByID(data.permissions, id);
            deleteInvalidProperties(data, ['name'])
            const editResult = await roleModel.updateOne({_id: role._id}, {
                $push: {permissions:  data.permissions}
            });
            if(!editResult.modifiedCount) throw createHttpError.InternalServerError("به روزرسانی نقش انجام نشد");
            return res.status(httpStatus.OK).json({
                statusCode: httpStatus.OK,
                message: "نقش با موفقیت به روزرسانی شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async deleteRole(req, res, next){
        try {
            const { field } = req.params;
            const role = await this.findRoleByIdOrname(field);
            const deleteResult = await roleModel.deleteOne({_id: role._id});
            if(!deleteResult.deletedCount) throw createHttpError.InternalServerError("حذف نقش انجام نشد");
            return res.status(httpStatus.OK).json({
                statusCode: httpStatus.OK,
                data: {
                    message: "نقش با موفقیت حذف شد"
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async findRoleByname(name){
        const role = await roleModel.findOne({name});
        if(role) throw createHttpError.BadRequest("نقش یا رول وارد شده وجود دارد")
    }

    async findRoleByIdOrname(field){
        const findQuery = mongoose.isValidObjectId(field)? {_id: field}: {name: field};
        const role = await roleModel.findOne(findQuery);
        if(!role) throw createHttpError.NotFound("نقش یا رول وارد شده یافت نشد");
        return role
    }
    async findPermissionByID(id, userID){
        const permissionID = mongoose.isValidObjectId(id);
        const permissions = await permissionModel.find({_id: {$in: id}});
        const rolePermission = await roleModel.findOne({_id: userID});
        id.map(permission=> {
            if('permission', rolePermission.permissions.includes(permission)) delete id[permission]
        })
        if(id.length !== permissions.length) throw createHttpError.NotFound("دسترسی وارد شده یافت نشد");
        return permissions
    }
}

module.exports = {
    RoleController: new RoleController()
}
