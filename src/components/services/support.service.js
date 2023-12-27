import axios from "axios"
import { toast } from "react-toastify"
import { headers } from "../public/function"

const getTickets = async() => {
    try {
        const result = await axios.get('admin/support/list', headers)
        toast.success(await result.message)
        return result.data?.tickets
    } catch (error) {
        toast.error(error.response?.data.message, {autoClose: 2000})
    }
}
const getTicketByID = async ID => {
    try {
        const result = await axios.get(`admin/support/${ID}`, headers)
        toast.success(await result.message)
        return result.data?.ticket
    } catch (error) {
        console.log(error.response?.data.message);
        toast.error(error.response?.data.message, {autoClose: 2000})
    }
}
const createTicket = async data => {
    try {
        const createTicketResult = await axios.post('admin/support/create', data, headers)
        toast.success(createTicketResult.data.message)
        return createTicketResult.data
    } catch (error) {
        toast.error(error.response?.data.message, {autoClose: 2000})
        
    }
}
const editTicket = async data => {
    try {
        const editPlans = await axios.patch(`admin/support/edit/${data._id}`, data, headers)
        toast.success(editPlans.data.message)
        return editPlans.data
    } catch (error) {
        toast.error(error.response?.data.message, {autoClose: 2000})
        
    }
}
const deleteTicket = async id => {
    try {
        const deletePlans = await axios.delete(`admin/support/delete/${id}`, headers)
        toast.success(deletePlans.data.message)
        return deletePlans.data
    } catch (error) {
        toast.error(error.response?.data.message, {autoClose: 2000})
        
    }
}
export {
    getTickets,
    createTicket,
    deleteTicket,
    editTicket,
    getTicketByID
}