import axios from "axios"
import { headers } from "../../public/function"
import { toast } from "react-toastify"

const addConfig = async data => {
    try {
        const result = await axios.post('admin/config/add', data, headers)
        toast.success(result.data.message)
        return result.data
    } catch (error) {
        toast.error(error.response.data.message, {autoClose: 2000})
    }
}
const resendConfig = async data => {
    try{
        const result = await axios.post('admin/user/resend', data, headers)
        toast.success(result.data.message)
        return result.data
    } catch (error) {
        toast.error(error.response.data.message, {autoClose: 2000})
    }
}
export {
    addConfig,
    resendConfig
}