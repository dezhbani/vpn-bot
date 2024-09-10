import axios from "axios"
import { toast } from "react-toastify"
import { headers } from "../../public/function"

const getPlans = async() => {
    try {
        const result = await axios.get('admin/plan/list', headers)
        toast.success(await result.message)
        return result.data?.plans
    } catch (error) {
        toast.error(error.response?.data.message, {autoClose: 2000})
    }
}
const addPlan = async data => {
    try {
        const addPlans = await axios.post('admin/plan/add', data, headers)
        toast.success(addPlans.data.message)
        return addPlans.data
    } catch (error) {
        toast.error(error.response?.data.message, {autoClose: 2000})
        
    }
}
const editPlan = async data => {
    try {
        const editPlans = await axios.patch(`admin/plan/edit/${data._id}`, data, headers)
        toast.success(editPlans.data.message)
        return editPlans.data
    } catch (error) {
        toast.error(error.response?.data.message, {autoClose: 2000})
        
    }
}
const deletePlan = async id => {
    try {
        const deletePlans = await axios.delete(`admin/plan/delete/${id}`, headers)
        toast.success(deletePlans.data.message)
        return deletePlans.data
    } catch (error) {
        toast.error(error.response?.data.message, {autoClose: 2000})
        
    }
}
export {
    getPlans,
    addPlan,
    deletePlan,
    editPlan
}