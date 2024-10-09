import React, { useState } from 'react';
import ExitIcon from '../assets/Exit.svg';
import SettingIcon from '../assets/Setting.svg';
import ProfileIcon from '../assets/Profile-2.svg';
import Modal from '../../public/components/Modal';

const ConfirmExitAccount = ({status, close}) => {
    const exitAccount = () => {
        localStorage.removeItem('accessToken')
        window.location.href = '/'
    }
    return (
        <Modal isOpen={status}>
            <div className='p-10 font-b-kamran text-2xl'>
                <p className='text-3xl'>آیا می‌خواهید از حساب‌ کاربری خود خارج شوید؟</p>
                <div className='mt-8 w-full  flex items-center'>
                    <button onClick={exitAccount} className='bg-red-500 flex items-center justify-center rounded-md py-1 mx-3 text-white w-1/2'>خروج</button>
                    <button onClick={close} className='bg-gray-200 flex items-center justify-center rounded-md py-1 mx-3 text-black w-1/2'>منصرف شدم</button>
                </div>
            </div>
        </Modal>
    )
}

const Profile = () => {
    const [openConfirm, setOpenConfirm] = useState(false)
    const handleOpenConfirm = () => {
        setOpenConfirm(true)
    }
    const handleCloseConfirm = () => setOpenConfirm(false)

    return (
        <>
            <ConfirmExitAccount close={handleCloseConfirm} status={openConfirm} />
            <div className='bg-white flex flex-col absolute w-48 mt-20 py-4 px-6 rounded-xl shadow-[2px_4px_30px_0px_#00000010] dir-rtl font-b-kamran text-2xl'>
                <div className='py-1 flex items-center'><img className='h-6' src={ProfileIcon}/><span className='mx-2'>پروفایل</span></div>
                <div className='py-1 flex items-center'><img className='h-6' src={SettingIcon}/><span className='mx-2'>تنظیمات</span></div>
                <div className='border-main-blue opacity-60 border-t-2 my-2' />
                <div className='py-1 flex items-center' onClick={handleOpenConfirm}><img className='h-6' src={ExitIcon}/><span className='mx-2'>خروج</span></div>
            </div>
        </>
    );
};

export default Profile;