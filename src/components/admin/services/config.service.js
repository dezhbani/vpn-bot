import axios from "axios"

const addConfig = async data => {
    const result = await axios.post('admin/config/add', data)
    return result.data
}
const resendConfig = async data => {
    const result = await axios.post('admin/user/resend', data)
    return result.data
}
export {
    addConfig,
    resendConfig
}