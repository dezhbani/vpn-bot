import React, { useEffect, useRef, useState } from 'react';
import ExitIcon from '../assets/Exit.svg';
import SettingIcon from '../assets/Setting.svg';
import ProfileIcon from '../assets/Profile-2.svg';
import Danger from '../assets/danger.webp';
import Modal from '../../public/components/Modal';
import { Link } from 'react-router-dom';

const ConfirmExitAccount = ({ status, close }) => {
    const exitAccount = () => {
        localStorage.removeItem('accessToken')
        window.location.href = '/'
    }
    return (
        <Modal isOpen={status}>
            <div className='p-5 sm:p-10 dir-rtl font-b-kamran text-2xl'>
                <div className='w-full flex justify-center my-12'>
                    <img className='w-40' src={Danger} alt='danger' />
                </div>
                <p className='text-2xl sm:text-3xl mb-2'>آیا می‌خواهید از حساب‌ کاربری خود خارج شوید؟</p>
                <div className='mt-10 w-full flex items-center'>
                    <button onClick={exitAccount} className='bg-red-500 flex items-center justify-center rounded-md py-1 mx-3 text-white w-1/2'>خروج</button>
                    <button onClick={close} className='bg-gray-200 flex items-center justify-center rounded-md py-1 mx-3 text-black w-1/2'>بازگشت</button>
                </div>
            </div>
        </Modal>
    )
}

const Profile = ({ setOpenProfile }) => {
    const [openConfirm, setOpenConfirm] = useState(false)
    const profileRef = useRef(null);


    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
        if (profileRef.current && !profileRef.current.contains(event.target)) {
            setOpenProfile(false);
        }
    };

    useEffect(() => {
        // Add event listener to detect clicks outside
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Cleanup the event listener when component unmounts
            document.removeEventListener('mousedown', handleClickOutside);
        };
    });
    const handleOpenConfirm = () => {
        setOpenConfirm(true)
    }
    const handleCloseConfirm = () => setOpenConfirm(false)

    return (
        <div ref={profileRef} >
            <ConfirmExitAccount close={handleCloseConfirm} status={openConfirm} />
            <div className='bg-white -mx-16 flex flex-col absolute w-48 mt-20 py-4 px-6 rounded-xl shadow-[2px_4px_30px_0px_#00000010] dir-rtl font-b-kamran text-2xl z-10'>
                <Link to='/profile'>
                    <div className='flex items-center'>
                        <img className='h-6' alt='ProfileIcon' src={ProfileIcon} />
                        <span className='mx-2'>پروفایل</span>
                    </div>
                </Link>
                <div className='py-1 flex items-center'>
                    <img className='h-6' alt='SettingIcon' src={SettingIcon} />
                    <span className='mx-2'>تنظیمات</span>
                </div>
                <div className='border-main-blue opacity-60 border-t-2 my-2' />
                <div className='py-1 flex items-center' onClick={handleOpenConfirm}>
                    <img className='h-6' alt='ExitIcon' src={ExitIcon} />
                    <span className='mx-2'>خروج</span>
                </div>
            </div>
        </div>
    );
};

export default Profile;