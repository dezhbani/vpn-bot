import React, { useContext, useEffect, useState } from 'react';
import styles from './Auth.module.css'
import GetMobile from './GetMobile';
import GetOtp from './GetOtp';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ServerError from '../admin/public/errors/ServerError';
import Loading from '../admin/public/Loading';
import { getUserProfile } from '../services/profile.service';
import { redirect } from '../public/function';
import { ProfileContext } from '../context/UserProfileContext';
import { Navigate } from 'react-router-dom';
import Forbidden from '../admin/public/errors/Forbidden';

const Auth = () => {
    const data = useContext(ProfileContext)
    const [ state, setState ] = useState({sendOTP: false, mobile: ''})
    const checkOTP = () => {
        if(state.sendOTP) return <GetOtp state={state} />
        return <GetMobile setState={setState} state={state} />
    }
    const checkProfile = () => { 
        switch (data?.status) {
            case 200:
                if(data.role !== "customer") return <Navigate to="/dashboard" />
            case 401:
                return <div className={styles.container}>{checkOTP()}</div>
            case 403:
                return <Forbidden />
            case 500:
                return <ServerError />
            default:
                return <ServerError />
        }
    }
    return (
        <>
            <div className={styles.main}>
                {   
                    checkProfile()
                }
            </div>
             
        </>
    );
};

export default Auth;