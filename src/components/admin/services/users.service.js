import axios from "axios"

const getUsers = async() => {
    const result = await axios.get('admin/user')
    return await result.data.users
}
const getUserDetails = async(id) => {
    const result = await axios.get(`admin/user/${id}`)
    return await result.data.user
}
const addUser = async data => {
    // const { name, price, user_count, data_size, pay_link, count, month } = data
    const result = await axios.post('admin/user/add', data)
    return result.data
}
const repurchase = async id => {
    const result = await axios.post(`admin/config/repurchase/${id}`)
    return result.data
}

export {
    getUsers,
    addUser,
    getUserDetails,
    repurchase
}