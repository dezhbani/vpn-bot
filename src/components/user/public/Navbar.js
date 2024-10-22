import React, { useState, useEffect, useRef } from 'react';
import Notification from '../assets/Notification.svg';
import ProfileIcon from '../assets/Profile.svg';
import Profile from './Profile';

const Navbar = () => {
    const [openProfile, setOpenProfile] = useState(false);
    const profileRef = useRef(null);

    const handleOpenProfile = () => setOpenProfile(!openProfile);

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
    }, []);

    return (
        <div className='bg-[#fff]/50 w-full pt-8 z-40 backdrop-blur-sm fixed top-0'>
            <div className='flex bg-white w-4/5 shadow-[2px_4px_30px_0px_#00000010] mx-5 rounded-xl'>
                <div className='p-2 m-2' ref={profileRef} onClick={handleOpenProfile}>
                    <img className='h-8' src={ProfileIcon} alt='Profile' />
                </div>
                    {openProfile && <Profile />}
                <div className='p-2 m-2'>
                    <img className='h-8' src={Notification} alt='Notification' />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
