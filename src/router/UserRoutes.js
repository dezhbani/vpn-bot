import React from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import Home from '../components/user/home-section/Home';
import Profile from '../components/user/profile-section/Profile';
import Plans from '../components/user/plan-section/Plans';
import Configs from '../components/user/config-section/Configs';
import Bills from '../components/user/bill-section/Bills';
import ConfigDetails from '../components/user/config-section/ConfigDetails';
import NotFoundError from '../components/admin/public/errors/NotFoundError';

const UserRoutes = () => {
    document.body.style.backgroundColor = '#f9f9f9';
    return (
        <>
            <Outlet />
            {/* Nested Routes */}
            <Routes>
                <Route path='home' element={<Home />} />
                <Route path='profile' element={<Profile />} />
                <Route path='plans' element={<Plans />} />
                <Route path='configs' element={<Configs />} />
                <Route path='bills' element={<Bills />} />
                <Route path='configs/:configID' element={<ConfigDetails />} />
                <Route path="*" element={<NotFoundError />} />

            </Routes>
        </>
    );
};

export default UserRoutes;