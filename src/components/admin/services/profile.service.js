import axios from "axios"
import { toast } from "react-toastify"
import { headers } from "../../public/function"

const getUserProfile = async () => {
    try {
        const result = await axios.get('profile', headers)
        return result?.data
    } catch (error) {
        // return error.response?.data
        // toast.error(error.response?.data.message || "مشکل در اتصال به سرور", {autoClose: 2000})
        
        return error.response
    }
}
const getBills = async () => {
    try {
        const result = await axios.get('profile/bills', headers)
        toast.success(result.data.message)
        return result.data.bills        
    } catch (error) {
        toast.error(error.response?.data.message || "مشکل در اتصال به سرور", {autoClose: 2000})
    }
}
export {
    getUserProfile,
    getBills
}