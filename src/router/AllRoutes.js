import { useContext } from "react";
import { ProfileContext } from "../components/context/UserProfileContext";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";
import { Navigate } from "react-router-dom";
import Modal from "../components/public/components/Modal";

const AllRoutes = () => {
    const adminRoles = ['admin', 'owner']
    const userRoles = ['customer']
    const data = useContext(ProfileContext)
    const UserRole = data?.role || ''
    const splitedRoles = UserRole.split(',')    

    const isUser = splitedRoles.some(role => userRoles.includes(role));
    const isAdmin = splitedRoles.some(role => adminRoles.includes(role));
    // if (!data) window.location.href = '/sign-up'
    if(isAdmin && isUser){
        return (
            <>
                {UserRoutes()}
                {AdminRoutes()}
            </>
        )
    } 
    if(isUser) return UserRoutes()
    else if(isAdmin) {
        <Navigate to="/dashboard" />
        return AdminRoutes()
    }
};

export default AllRoutes;