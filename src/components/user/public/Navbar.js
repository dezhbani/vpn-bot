import React, { useState } from 'react';
import Notification from '../assets/Notification.svg';
import ProfileIcon from '../assets/Profile.svg';
import Profile from './Profile';

const Navbar = ({menu}) => {
    const [openProfile, setOpenProfile] = useState(false);

    const handleOpenProfile = () => setOpenProfile(!openProfile);

    return (
        // <div className='h-full w-full pt-8 z-40 fixed top-0'>
            // <div className='bg-[#fff]/50 backdrop-blur-sm w-full'>
                <div className={`flex bg-white m-4 lg:mt-8 z-80 fixed top-0 ${menu?'w-[calc(50%-3.5rem)]': 'w-[calc(100%-7rem)]'} sm:w-[calc(75%-3.5rem)] lg:w-[calc(80%-2rem)] xl:w-4/5 shadow-[2px_4px_30px_0px_#00000010] rounded-xl`}>
                    <div className='p-2 m-2' onClick={handleOpenProfile}>
                        <img className='h-8' src={ProfileIcon} alt='Profile' />
                    </div>
                {openProfile && <Profile setOpenProfile={setOpenProfile} />}
                    <div className='p-2 m-2'>
                        <img className='h-8' src={Notification} alt='Notification' />
                    </div>
                </div>
            // </div>
        // </div>
    );
};

export default Navbar;
