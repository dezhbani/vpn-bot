import axios from "axios"

const addConfig = async data => {
    const result = await axios.post('admin/config/add', data)
    return result.data
}
export {
    addConfig
}