import axios from "axios"
import { handleError, headers } from "../../public/function"

const getAllBills = async ({page, limit}) => {
    try {
        const result = await axios.get(`profile/bills?page=${page || 0}&limit=${limit}`, headers)
        return result.data
    } catch (error) {
        handleError(error)
    }
}

export {
    getAllBills
}