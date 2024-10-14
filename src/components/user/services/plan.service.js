import axios from "axios"
import { handleError, headers } from "../../public/function"

const getPlans = async () => {
    try {
        const result = await axios.get('user/plan/list', headers)
        return result.data
    } catch (error) {
        handleError(error)
    }
}
export {
    getPlans
}