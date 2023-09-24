import React, { useEffect, useState } from 'react';
import styles from './Auth.module.css'
import GetMobile from './GetMobile';
import GetOtp from './GetOtp';
import { profile } from '../admin/services/profile.service';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Auth = () => {

    const [ state, setState ] = useState({sendOTP: false, mobile: ''})
    const [ data, setData ] = useState({status: 0})
    const accessToken = localStorage.getItem('accessToken')
    const getProfile = async () => {
        const profile1 = await profile()
        setData(profile1)
    }
    useEffect(() => {
        getProfile()
    }, [])
    const checkOTP = () => {
        if(state.sendOTP) return <GetOtp state={state} />
        return <GetMobile setState={setState} state={state} />
    }
    const checkProfile = () => {
        if(accessToken || data?.status == 200){
            if(data?.status == 200){
                return window.location.href = '/dashboard'
            }
        }else{
            return checkOTP()
        }
    }
    return (
        <div className={styles.main}>
            <div className={styles.container}>
                {   
                    checkProfile()
                }
            </div>
            <ToastContainer />
        </div>
    );
};

export default Auth;