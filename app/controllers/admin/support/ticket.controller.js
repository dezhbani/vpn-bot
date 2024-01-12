const { StatusCodes } = require("http-status-codes");
const { createTicketSchema, replyTicketSchema } = require("../../../validations/admin/ticket.schema");
const { ticketModel } = require("../../../models/ticket");
const createHttpError = require("http-errors");
const { Controllers } = require("../../controller");
const { userModel } = require("../../../models/user");
const { timestampToDate } = require("../../../../bot/utils/functions");

class ticketController extends Controllers {
    async createTicket(req, res, next){
        try {
            const { _id: user } = req.user;
            const { title, description } = await createTicketSchema.validateAsync(req.body);
            const createResult = await ticketModel.create({title, description, user});
            // console.log(createResult);
            if(!createResult) throw createHttpError.InternalServerError("تیکت شما ثبت نشد. لطفا مچدد تلاش کنید");
            return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.CREATED, 
                message: ".تیکت شما با موفقیت ثبت شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async getAllTicket(req, res, next){
        try {
            const {role, _id} = req.user;
            const tickets = await ticketModel.find(role == 'owner'? {} : {user: _id});
            tickets.map(ticket => {
                const time = timestampToDate(ticket.updatedAt, true)
                return ticket.updatedAt = time
            })
            if(!tickets) throw createHttpError.InternalServerError("تیکتی وجود ندارد");
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                tickets
            })
        } catch (error) {
            next(error)
        }
    }
    async getTicketByID(req, res, next){
        try {
            const {role, _id} = req.user;
            const { ticketID } = req.params;
            const findQuery = role == 'owner'? {}:{_id: ticketID, user: _id}
            let ticket = await ticketModel.findOne(findQuery);
            if(!ticket) throw createHttpError.NotFound("تیکتی یافت نشد");
            const time = timestampToDate(ticket.updatedAt, true)
            ticket.updatedAt = time;
            ticket = await userModel.populate(ticket, {
                path: 'user reply.user',
                select: '-bills -configs -otp -chatID -wallet'
            })
            if(!ticket) throw createHttpError.NotFound("تیکت یافت نشد");
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                ticket
            })
        } catch (error) {
            next(error)
        }
    }
    async getMyTickets(req, res, next){
        try {
            const { _id: user } = req.user;
            const tickets = await ticketModel.find({user});
            if(!tickets) throw createHttpError.InternalServerError("تیکتی وجود ندارد");
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                tickets
            })
        } catch (error) {
            next(error)
        }
    }
    async replyTicket(req, res, next){
        try {
            const { _id: user } = req.user;
            const { ticketID } = req.params;
            const { reply } = await replyTicketSchema.validateAsync(req.body);
            const replyResult = await ticketModel.updateOne({ _id: ticketID }, { $push: {reply: { reply, user }}})
            if(!replyResult) throw createHttpError.InternalServerError("جواب تیکت ثبت نشد. لطفا مچدد تلاش کنید");
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                message: "جواب تیکت با موفقیت ثبت شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async deleteTicket(req, res, next){
        try {
            const { ticketID } = req.params;
            const deleteResult = await ticketModel.deleteOne({ _id: ticketID })
            if(!deleteResult) throw createHttpError.InternalServerError("تیکت حذف نشد");
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                message: "تیکت با موفقیت حذف شد"
            })
        } catch (error) {
            next(error)
        }
    }
    async changeTicketStatus(req, res, next){
        try {
            const { ticketID } = req.params;
            const deleteResult = await ticketModel.deleteOne({ _id: ticketID })
            if(!deleteResult) throw createHttpError.InternalServerError("تیکت حذف نشد");
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK, 
                message: "تیکت با موفقیت حذف شد"
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = {
    ticketController: new ticketController()
}
