import axios from "axios"

const getPlans = async() => {
    const allPlans = await axios.get('admin/plan')
    return allPlans.data.plans
}
const addPlan = async data => {
    const { name, price, user_count, data_size, pay_link, count, month } = data
    const addPlans = await axios.post('admin/plan/add', {
        name,
        price, 
        user_count, 
        data_size, 
        pay_link, 
        count,
        month
    })
    return addPlans.data
}
const editPlan = async data => {
    const { name, price, user_count, data_size, pay_link, count, month, _id } = data
    const addPlans = await axios.patch(`admin/plan/edit/${_id}`, {
        name,
        price, 
        user_count, 
        data_size, 
        pay_link, 
        count,
        month
    })
    return addPlans.data
}
const deletePlan = async id => {
    const allPlans = await axios.delete(`admin/plan/delete/${id}`)
    return allPlans.data
}
export {
    getPlans,
    addPlan,
    deletePlan,
    editPlan
}