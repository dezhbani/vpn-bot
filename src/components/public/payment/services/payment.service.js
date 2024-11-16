import axios from "axios"
import { toast } from "react-toastify"
import { headers } from "../../function";

const verifyWalletTransaction = async (id, authority) => {
    try {
        
        const result = await axios.get(`payment/verify/wallet/${id}/${authority}`, headers)
        return result?.data
    } catch (error) {
        toast.error(error.response?.data.message || "مشکل در اتصال به سرور", {autoClose: 2000})
        console.log(error.response);
        return error.response?.data
    }
}
export {
    verifyWalletTransaction
}