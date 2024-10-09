import React from 'react';
import { Route } from 'react-router-dom';
import CompleteProfile from '../components/auth/CompleteProfile';

const CompleteSignupRoutes = () => {
    document.body.style.backgroundColor = '#f9f9f9'

    return (
        <>
            <Route path='/complete-signup' element={<CompleteProfile/>} />
        </>
    );
};

export default CompleteSignupRoutes;