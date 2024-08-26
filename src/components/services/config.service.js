import axios from "axios"
import { handleError, headers } from "../public/function"
import { toast } from "react-toastify"

const addConfig = async data => {
    try {
        const result = await axios.post('admin/config/add', data, headers)
        toast.success(result.data.message)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
const changeConfigsStatus = async data => {
    try {
        const result = await axios.post('admin/config/changeStatus', data, headers)
        toast.success(result.data.message)
        return result.data
    } catch (error) {
        handleError(error)
        return error.response.data.message
    }
}
const activeConfig = async ID => {
    try {
        const result = await axios.get(`admin/config/active/${ID}`, headers)
        console.log(result);
        toast.success(result.data.message)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
const resendConfig = async data => {
    try{
        const result = await axios.post('admin/user/resend', data, headers)
        toast.success(result.data.message)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
const getConfigsList = async () => {
    try{
        const result = await axios.get('admin/config', headers)
        toast.success(result.data.message)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
const getConfigsByDay = async day => {
    try{
        const result = await axios.post('admin/config/endedTime', day, headers)
        toast.success(result.data.message)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
export {
    addConfig,
    activeConfig,
    getConfigsList,
    changeConfigsStatus,
    resendConfig,
    getConfigsByDay
}