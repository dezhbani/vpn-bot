import axios from "axios"
import { headers } from "../public/function"
import { toast } from "react-toastify"

const getUsers = async() => {
    try {
        const result = await axios.get('admin/user/list', headers)
        toast.success(await result.message)
        return result.data
    } catch (error) {
        toast.error(error.response?.data.message || "مشکل در اتصال به سرور", {autoClose: 2000})
        return error.response?.data
    }
}
const getUserDetails = async(id) => {
    try {
        const result = await axios.get(`admin/user/${id}`, headers)
        toast.success(await result.message)
        return result.data.user
    } catch (error) {
        toast.error(error.response.data.message, {autoClose: 2000})
    }
}
const getBillDetails = async(id) => {
    try {
        const result = await axios.get(`admin/user/bill/${id}`, headers)
        return result.data.bill
    } catch (error) {
        toast.error(error.response.data.message, {autoClose: 2000})
    }
}
const addUser = async data => {
    try {
        const result = await axios.post('admin/user/add', data, headers)
        return result.data
    } catch (error) {
        toast.error(error.response.data.message, {autoClose: 2000})
    }
}
const editUser = async data => {
    try {
        console.log(data);
        const result = await axios.patch(`admin/user/edit/${data._id}`, data, headers)
        toast.success(result.data.message)
        return result.data
    } catch (error) {
        toast.error(error.response.data.message, {autoClose: 2000})
    }
}
const repurchase = async (userID, configID, handleClose) => {
    try {
        const result = await axios.post('admin/config/repurchase', {userID, configID}, headers)
        toast.success(result.data.message)
        if(result.data.message) handleClose()
        return result.data
    } catch (error) {
        toast.error(error.response?.data?.message, {autoClose: 2000})
        handleClose()
    }
}

export {
    getUsers,
    addUser,
    getUserDetails,
    repurchase,
    editUser,
    getBillDetails
}