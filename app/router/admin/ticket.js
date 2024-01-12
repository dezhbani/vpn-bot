const router = require("express").Router();
const { ticketController } = require("../../controllers/admin/support/ticket.controller");

router.post("/create", ticketController.createTicket)
router.get("/list", ticketController.getAllTicket)
router.get("/my-tickets", ticketController.getMyTickets)
router.post("/reply/:ticketID", ticketController.replyTicket)
router.delete("/delete/:ticketID", ticketController.deleteTicket)
router.get("/:ticketID", ticketController.getTicketByID)

module.exports = {
    adminSupportRoutes: router
}