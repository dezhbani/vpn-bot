import { useContext } from "react";
import { ProfileContext } from "../components/context/UserProfileContext";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";
import { Navigate, Route } from "react-router-dom";
import Modal from "../components/public/components/Modal";
import CompleteProfile from "../components/auth/CompleteProfile";
import CompleteSignupRoutes from "./CompleteSignupRoutes";

const AllRoutes = () => {
    
    const adminRoles = ['admin', 'owner']
    const userRoles = ['customer']
    const data = useContext(ProfileContext)
    const UserRole = data?.role || ''
    const splitedRoles = UserRole.split(',')    

    const isUser = splitedRoles.some(role => userRoles.includes(role));
    const isAdmin = splitedRoles.some(role => adminRoles.includes(role));

    if((data.status !== 401) && !data.first_name || !data.last_name || !data.full_name) return CompleteSignupRoutes()
    else if(isAdmin && isUser){
        return (
            <>
                {UserRoutes()}
                {AdminRoutes()}
            </>
        )
    } 
    else if(isUser) return UserRoutes()
    else if(isAdmin) {
        <Navigate to="/dashboard" />
        return AdminRoutes()
    }
};

export default AllRoutes;