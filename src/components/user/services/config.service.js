import axios from "axios"
import { handleError, headers } from "../../public/function"

const getConfigs = async () => {
    try {
        const result = await axios.get('user/config/list', headers)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
const getAllConfigs = async () => {
    try {
        const result = await axios.get('user/config/all', headers)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
const getConfigDetails = async configID => {
    try {
        const result = await axios.get(`user/config/details/${configID}`, headers)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
export {
    getConfigs,
    getConfigDetails,
    getAllConfigs
}