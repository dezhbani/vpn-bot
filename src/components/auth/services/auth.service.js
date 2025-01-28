import axios from "axios"
import { handleError } from "../../public/function"

const getOTP = async data => {
    try {
        const result = await axios.post('auth/get-otp', data)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
const checkOTP = async data => {
    try {
        const result = await axios.post("auth/check-otp", data)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
export {
    getOTP,
    checkOTP
}