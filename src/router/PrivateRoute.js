import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { ProfileContext } from '../components/context/UserProfileContext';
import Modal from '../components/public/components/Modal';
import NotFoundError from '../components/admin/public/errors/NotFoundError';

const PrivateRoute = ({ allowedRoles }) => {
    const user = useContext(ProfileContext)

    if(!user) return <Modal isOpen={true} loading={true} />

    if (!user.role) {
        return <Navigate to="/sign-up" replace />;
    }

    // نقش‌ها را بررسی کن
    const splitedRoles = user.role.split(',');
    const isAllowed = allowedRoles.some(role => splitedRoles.includes(role));

    if (!isAllowed) {
        return <NotFoundError />; // صفحه دسترسی غیرمجاز
    }

    return <Outlet />;
};

export default PrivateRoute;