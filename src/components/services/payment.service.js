import axios from "axios"
import { toast } from "react-toastify"
import { headers } from "../public/function"

const verifyTransaction = async (id, authority) => {
    try {
        const result = await axios.get(`payment/verify/${id}/${authority}`, headers)
        console.log(result.data.bill);
        return result?.data
    } catch (error) {
        toast.error(error.response?.data.message || "مشکل در اتصال به سرور", {autoClose: 2000})
        return error.response?.data
    }
}
const verifyWalletTransaction = async (id, authority) => {
    try {
        const result = await axios.get(`payment/verify/wallet/${id}/${authority}`, headers)
        return result?.data
    } catch (error) {
        toast.error(error.response?.data.message || "مشکل در اتصال به سرور", {autoClose: 2000})
        return error.response?.data
    }
}
const updateWallet = async (pay) => {
    try {
        const result = await axios.patch('admin/user/wallet/64a5b37e19fc81c514fdb629', {
            pay
        }, headers)
        console.log(result);
        return result?.data
    } catch (error) {
        toast.error(error.response?.data.message || "مشکل در اتصال به سرور", {autoClose: 2000})
        return error.response?.data
    }
}
export {
    verifyTransaction,
    updateWallet,
    verifyWalletTransaction
}