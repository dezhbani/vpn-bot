import React, { useState } from 'react';
import Notification from '../assets/Notification.svg';
import ProfileIcon from '../assets/Profile.svg';
import Profile from './Profile';

const Navbar = () => {
    const [openProfile, setOpenProfile] = useState(false);

    const handleOpenProfile = () => setOpenProfile(!openProfile);

    return (
        // <div className='h-full w-full pt-8 z-40 fixed top-0'>
            <div className='bg-[#fff]/50 w-full pt-8 z-40 backdrop-blur-sm fixed top-0'>
                <div className='flex bg-white w-4/5 shadow-[2px_4px_30px_0px_#00000010] mx-5 rounded-xl'>
                    <div className='p-2 m-2' onClick={handleOpenProfile}>
                        <img className='h-8' src={ProfileIcon} alt='Profile' />
                    </div>
                {openProfile && <Profile setOpenProfile={setOpenProfile} />}
                    <div className='p-2 m-2'>
                        <img className='h-8' src={Notification} alt='Notification' />
                    </div>
                </div>
            </div>
        // </div>
    );
};

export default Navbar;
