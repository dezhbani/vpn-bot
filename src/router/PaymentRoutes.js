import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Invoice from '../components/public/payment/components/Invoice';

const PaymentRoutes = () => {
    return (
        <>
            <Outlet />
            <Routes>
                <Route path="/wallet/:billID" element={<Invoice />} />
            </Routes>
        </>
    );
};

export default PaymentRoutes;