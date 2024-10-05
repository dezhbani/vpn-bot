import React from 'react';
import Notification from '../assets/Notification.svg';
import ProfileIcon from '../assets/Profile.svg';

const Navbar = () => {
    return (
        <div className='flex bg-white w-4/5 shadow-[2px_4px_30px_0px_#00000010] mt-8 mb-5 mx-5 rounded-xl fixed top-0 z-[9999]'>
            <div className='p-2 m-2'>
                <img className='h-8' src={ProfileIcon} alt='Profile' />
            </div>
            <div className='p-2 m-2'>
                <img className='h-8' src={Notification} alt='Notification' />
            </div>
        </div>
    );
};

export default Navbar;