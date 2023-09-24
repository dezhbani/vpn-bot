import axios from "axios"
import { toast } from "react-toastify"
import { headers } from "../../public/function";

const profile = async data => {
    try {
        const result = await axios.get('profile', headers)
        return result.data
    } catch (error) {
        toast.error(error.response.data.message, {autoClose: 2000})
    }
}
export {
    profile
}