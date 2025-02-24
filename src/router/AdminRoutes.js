import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import HomePage from '../components/admin/home/HomePage';
import Plans from '../components/admin/plan-section/Plans';
import Users from '../components/admin/user-section/Users';
import Bills from '../components/admin/bill-section/Bills';
import Tickets from '../components/admin/support-section/Tickets';
import Configs from '../components/admin/config-section/Configs';
import NotFoundError from '../components/admin/public/errors/NotFoundError';

const AdminRoutes = () => {
    document.body.style.backgroundColor = '#fff';
    return (
        <>
            <Outlet />
            <Routes>
                <Route index element={<HomePage />} /> 
                <Route path="plans" element={<Plans />} />
                <Route path="users" element={<Users />} />
                <Route path="bills" element={<Bills />} />
                <Route path="support" element={<Tickets />} />
                <Route path="configs" element={<Configs />} />
                <Route path="*" element={<NotFoundError />} />
            </Routes>
        </>
    );
};

export default AdminRoutes;