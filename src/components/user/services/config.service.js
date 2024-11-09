import axios from "axios"
import { handleError, handleMessage, headers } from "../../public/function"

const buyConfig = async data => {
    try {
        const result = await axios.post('user/config/buy', data, headers)
        handleMessage(result.data)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
const repurchaseConfig = async data => {
    try {
        const result = await axios.post('user/config/repurchase', data, headers)
        handleMessage(result.data)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
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
const getConfigByID = async configID => {
    try {
        const result = await axios.get(`user/config/${configID}`, headers)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
export {
    getConfigs,
    getConfigDetails,
    getAllConfigs,
    getConfigByID,
    buyConfig,
    repurchaseConfig
}