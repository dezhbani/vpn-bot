import axios from "axios"
import { handleError, handleMessage, headers } from "../../public/function"

const getProfile = async () => {
    try {
        const result = await axios.get('user/profile', headers)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
const editProfile = async data => {
    try {
        const result = await axios.patch('user/profile/edit', data, headers)
        handleMessage(result.data)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
const changeMobile = async data => {
    try {
        const result = await axios.post('user/profile/change-mobile', data, headers)
        handleMessage(result.data)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
const checkOTP = async data => {
    try {
        const result = await axios.post('user/profile/check-otp', data, headers)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
export {
    getProfile,
    editProfile,
    changeMobile,
    checkOTP
}