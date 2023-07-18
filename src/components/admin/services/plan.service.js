import axios from "axios"
import { toast } from "react-toastify"
import { headers } from "../../public/function"

const getPlans = async() => {
    try {
        const result = await axios.get('admin/plan/list', headers)
        toast.success(await result.message)
        return result.data?.plans
    } catch (error) {
        toast.error(error.response.data.message, {autoClose: 2000})
    }
}
const addPlan = async data => {
    const addPlans = await axios.post('admin/plan/add', data, headers)
    return addPlans.data
}
const editPlan = async data => {
    const editPlans = await axios.patch(`admin/plan/edit/${data._id}`, data, headers)
    return editPlans.data
}
const deletePlan = async id => {
    const deletePlans = await axios.delete(`admin/plan/delete/${id}`, headers)
    return deletePlans.data
}
export {
    getPlans,
    addPlan,
    deletePlan,
    editPlan
}