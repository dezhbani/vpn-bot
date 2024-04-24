import React, { useContext, useState } from 'react';
import styles from './Auth.module.css'
import GetMobile from './GetMobile';
import GetOtp from './GetOtp';
import 'react-toastify/dist/ReactToastify.css';
import ServerError from '../admin/public/errors/ServerError';
import { ProfileContext } from '../context/UserProfileContext';
import { Navigate } from 'react-router-dom';
import Forbidden from '../admin/public/errors/Forbidden';
import Modal from '../public/components/Modal';
import Loading from './Loading';

const Auth = () => {
    const data = useContext(ProfileContext)
    const [loading, setLoading] = useState(false);
    const [ state, setState ] = useState({sendOTP: false, mobile: ''})
    const checkOTP = () => {
        if(state.sendOTP) return <GetOtp loading={loading} setLoading={setLoading} state={state} />
        return <GetMobile loading={loading} setLoading={setLoading} setState={setState} state={state} />
    }
    const checkProfile = () => { 
        console.log(data);
        switch (data?.status) {
            case 200:
                if(data.role !== "customer") return <Navigate to="/dashboard" />
            case 401:
                return <div className='bg-white rounded-lg p-7 m-24 h-80 w-fit'>{checkOTP()}</div>
            case 403:
                return <Navigate to="/dashboard" />
            case 500:
                return <Navigate to="/dashboard" />
            default:
                return <Navigate to="/dashboard" />
        }
    }
    return (
        <div className='flex justify-center bg-[#f9f9f9] min-h-screen items-center'>
            {   
                checkProfile()
            }
            <Modal isOpen={loading} loading={loading} />
        </div>
    );
};

export default Auth;