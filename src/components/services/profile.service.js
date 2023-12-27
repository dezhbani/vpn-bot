import axios from "axios"
import { toast } from "react-toastify"
import { headers } from "../public/function"

const getUserProfile = async (setData) => {
    try {
        const result = await axios.get('profile', headers)
        setData(result?.data)
    } catch (error) {
        setData(error.response?.data);
        toast.error(error.response?.data.message || "مشکل در اتصال به سرور", {autoClose: 2000})
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