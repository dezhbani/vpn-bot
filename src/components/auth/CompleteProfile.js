import React, { useContext, useEffect, useState } from 'react';
import { ProfileContext } from '../context/UserProfileContext';
import ProfileIcon from '../user/assets/Profile-2.svg';
import axios from 'axios';
import { toast } from 'react-toastify';
import { headers } from '../public/function';
import { Navigate } from 'react-router-dom';

const CompleteProfile = () => {
    const user = useContext(ProfileContext);
    const [data, setData] = useState({
        first_name: "",
        last_name: "",
        full_name: ""
    });
    
    if(headers.headers.authorization == 'bearer null') window.location.replace("/sign-up")
    
    // Set the initial state based on user data or an empty string

    // Update state when user changes an input
    const change = (event) => {
        setData({ ...data, [event.target.name]: event.target.value });
    };

    useEffect(() => {
        setData({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            full_name: user.full_name || ""
        })
    }, [user])
    
    const completeUserData = async () => {
        try {
            const res = await axios.post("auth/complete-signup", data, headers);
            if(res.data.status == 200) window.location.replace('/home')
        } catch (error) {
            toast.error(error.response.data.message, {autoClose: 2000})
        }
    }
    if(user.first_name && user.last_name && user.full_name) return <Navigate to={'/sign-up'} replace />
    
    if(headers.headers.authorization !== 'bearer null') return (
        <div className='min-h-screen flex justify-center items-center'>
            <div className='bg-white rounded-xl p-5 flex flex-col shadow-[2px_4px_30px_0px_#00000010] dir-rtl font-iran-sans'>
                <div className='flex items-center text-xl'>
                    <img className='h-8' src={ProfileIcon} alt="Profile Icon" />
                    <span className='p-2'>تکمیل اطلاعات حساب</span>
                </div>
                <div className='flex flex-col'>
                    <input
                        onChange={change}
                        type='text'
                        className='font-outfit-semiBold font-extralight placeholder:font-iran-sans invalid:bg-black border-gray-400 w-64 py-3 px-3 text-lg text-black leading-tight focus:border-blue-500 focus:outline-none focus:shadow-outlin border-2 rounded-md my-3 mx-7 h-10 dir-rtl'
                        name='first_name'
                        value={user.first_name || data.first_name}
                        placeholder='نام لاتین'
                    />
                    <input
                        onChange={change}
                        type='text'
                        className='font-outfit-semiBold font-extralight placeholder:font-iran-sans invalid:bg-black border-gray-400 w-64 py-3 px-3 text-lg text-black leading-tight focus:border-blue-500 focus:outline-none focus:shadow-outlin border-2 rounded-md my-3 mx-7 h-10 dir-rtl'
                        name='last_name'
                        value={user.last_name || data.last_name}
                        placeholder='نام خانوادگی لاتین'
                    />
                    <input
                        onChange={change}
                        type='text'
                        className='invalid:bg-black font-bold border-gray-400 w-64 py-3 px-3 text-lg text-black leading-tight focus:border-blue-500 focus:outline-none focus:shadow-outlin border-2 rounded-md my-3 mx-7 h-10 dir-rtl'
                        name='full_name'
                        value={user.full_name || data.full_name}
                        placeholder='نام و نام خانوادگی فارسی'
                    />
                    <div className='flex justify-center items-center mx-7 my-6'>
                        <button onClick={completeUserData} className='bg-main-blue hover:bg-[#0079d0] transition-colors duration-700 w-full py-2 rounded-md text-white text-lg font-bold'>
                            ثبت
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;
