import React, { useContext, useState } from 'react';
import Loading from '../public/Loading';
import { ProfileContext } from '../../context/UserProfileContext';
import UserDetails from './UserDetails';
import RepurchaseConfig from './RepurchaseConfig';

const User = ({user}) => {
    const [openDetails, setOpenDetails] = useState(false);
    const [openRepurchase, setOpenRepurchase] = useState(false);
    const handleOpenDetails = () => setOpenDetails(true);
    const handleOpenRepurchase = () => setOpenRepurchase(true);

    const profile = useContext(ProfileContext)
    if(!profile?.role) return <Loading />
    
    return (
        <div className="flex max-md:w-full no-underline flex-col m-3 font-[iran-sans] text-base sm:mx-4 sm:my-4"> 
            <div className="flex bg-white flex-col md:w-72 px-1 py-4 shadow-md rounded-lg">
                <p className='flex justify-center p-1 text-sm'>{user.full_name}</p>
                <p className='flex justify-center p-1 text-sm'>{user.mobile}</p>
                <div className='flex justify-center p-1 font-medium'>
                    <button className='bg-none border-none text-blue-500 flex justify-center items-center p-1 mx-1' onClick={handleOpenDetails}>جزئیات</button>
                    <button className='bg-blue-500 text-white flex justify-center items-center py-1 px-3 mx-1  rounded' onClick={handleOpenRepurchase}>تمدید کانفیگ</button>
                </div>
                <UserDetails open={openDetails} setOpen={setOpenDetails} user={user} />
                <RepurchaseConfig open={openRepurchase} setOpen={setOpenRepurchase} userID={user._id} />
            </div>
        </div>
    );
};

export default User;