import React, { useContext, useState } from 'react';
import GetMobile from './GetMobile';
import GetOtp from './GetOtp';
import 'react-toastify/dist/ReactToastify.css';
import ServerError from '../admin/public/errors/ServerError';
import { ProfileContext } from '../context/UserProfileContext';
import { Link, Navigate } from 'react-router-dom';
import Forbidden from '../admin/public/errors/Forbidden';
import Modal from '../public/components/Modal';
import Loading from './Loading';
import UserIcon from './assets/User.svg';
import AdminIcon from './assets/Admin.svg';

const Auth = () => {
    const userRoles = ['customer']
    const adminRoles = ['admin', 'owner']
    const data = useContext(ProfileContext)
    const [loading, setLoading] = useState(false);
    const [ state, setState ] = useState({sendOTP: false, mobile: ''})
    const UserRole = data?.role || ''
    const splitedRoles = UserRole.split(',')    

    const isUser = splitedRoles.some(role => userRoles.includes(role));
    const isAdmin = splitedRoles.some(role => adminRoles.includes(role));
    console.log(isAdmin && isUser);
    
    // if (!data) window.location.href = '/sign-up'
    const checkOTP = () => {
        if(state.sendOTP) return <GetOtp loading={loading} setLoading={setLoading} state={state} />
        return <GetMobile loading={loading} setLoading={setLoading} setState={setState} state={state} />
    }
    const selectPanel = () => {
      return (
        <Modal isOpen={true}>
          <div className='dir-ltr flex flex-col m-5'>
            <Link to='/profile'>
              <div className='flex bg-white shadow-md pr-4 pl-8 py-3 my-3 mx-3 rounded-lg border-2 border-transparent hover:border-[#0095FF] transition-all duration-300'>
                <p className='text-2xl font-[iran-sans] px-8'>پنل کاربری</p>
                <img className='h-8' src={UserIcon} alt="User Icon" />
              </div>
            </Link>
            <Link to='/dashboard'>
              <div className='flex bg-white shadow-md pr-4 pl-8 py-3 my-3 mx-3 rounded-lg border-2 border-transparent hover:border-[#0095FF] transition-all duration-300'>
                <p className='text-2xl font-[iran-sans] px-8'>پنل فروش</p>
                <img className='h-8' src={AdminIcon} alt="Admin Icon" />
              </div>
            </Link>
          </div>
        </Modal>
      );
    };
    const checkProfile = () => { 
        switch (data?.status) {
            case 200:
                if(isAdmin && isUser) return selectPanel()
                else if(data.role == "owner") return <Navigate to="/dashboard" />
                else if(data.role == "customer") return <Navigate to="/profile" />
            case 401:
                return <div className='bg-white rounded-lg p-7 m-24 h-80 w-fit'>{checkOTP()}</div>
            case 403:
                // return <Navigate to="/dashboard" />
            default:
                return <div className='bg-white rounded-lg p-7 m-24 h-80 w-fit'>{checkOTP()}</div>
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