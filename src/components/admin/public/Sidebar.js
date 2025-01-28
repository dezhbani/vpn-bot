import React, { useContext, useState } from 'react';
import plans from '../assets/plans.svg'
import users from '../assets/user.svg'
import userProfile from '../assets/profile.png'
import configs from '../assets/configs.svg'
import payments from '../assets/payment.svg'
import home from '../assets/home.svg'
import menuIcon from '../assets/Menu.svg'
import closeMenuIcon from '../assets/Close.svg'
//Styles
import { Link } from 'react-router-dom';
import { ProfileContext } from '../../context/UserProfileContext';
import UpdateWallet from '../payment-section/UpdateWallet';
import Modal from '../../public/components/Modal';

const Sidebar = () => {
    const [ open, setOpen ] = useState(false)
    const [ menu, setMenu ] = useState(false)
    const handleOpen = () => setOpen(true);
    const openMenu = () => setMenu(true);
    const closeMenu = () => setMenu(false);
    const profile = useContext(ProfileContext)

    const ItemStyle = menu? "flex px-2 text-xl" : "hidden sm:px-2 sm:flex sm:text-xl md:text-2xl"

    if(!profile?.role) return <Modal isOpen={true} loading={true} />
    return (
        <>
        <div className={`${menu? 'w-1/2': 'w-[4.5rem]'} bg-white z-0 dir-rtl fixed right-0 float-right h-screen border-l-2 border-solid border-[#e5eaef] sm:w-1/4 lg:w-1/6 xl:w-[15%]`}>
            <UpdateWallet setOpen={setOpen} open={open} userID={profile._id} />
            <div className='p-4 sm:p-6'>
                <div className='sm:hidden m-2'>
                    {   
                        menu?
                        <img onClick={closeMenu} className='-rotate-90 transition-transform duration-200' src={closeMenuIcon} alt='close menu' />
                        :<img onClick={openMenu} className='-rotate-180 transition-transform duration-200' src={menuIcon} alt='menu' />
                    }
                </div>
                <div className={'h-1/3'}>
                    <div className='flex justify-center'>
                        <img className='flex justify-center h-10 w-10 sm:h-10 sm:w-10 lg:h-12 lg:w-12' alt='profile' src={userProfile} />
                    </div>
                    <div className='hidden sm:my-2 sm:flex sm:justify-center sm:text-base'>{profile?.full_name}</div>
                </div>
            </div>
            <ul className="my-9 font-[b-kamran]">
                <Link className="no-underline text-[#676d7c]" to='/dashboard'>
                    <li className="py-1 px-4 m-1 flex items-center hover:rounded-tl-xl hover:rounded-bl-xl hover:text-white hover:bg-blue-400 sm:px-2 md:m-2">
                        <img className="h-6 blu md:h-7" src={home} alt='home'/>

                        <div className={ItemStyle}>خانه</div>
                    </li>
                </Link>
                <Link className="no-underline text-[#676d7c]" to='/dashboard/users'>
                    <li className="py-1 px-4 m-1 flex items-center hover:rounded-tl-xl hover:rounded-bl-xl hover:text-white hover:bg-blue-400 sm:px-2 md:m-2">
                        <img className="h-6 md:h-7" src={users} alt='users'/>

                        <div className={ItemStyle}>کاربران</div>
                    </li>
                </Link>
                <Link className="no-underline text-[#676d7c]" to='/dashboard/plans'>
                    <li className="py-1 px-4 m-1 flex items-center hover:rounded-tl-xl hover:rounded-bl-xl hover:text-white hover:bg-blue-400 sm:px-2 md:m-2">
                        <img className="h-6 md:h-7" src={plans} alt='plans'/>

                        <div className={ItemStyle}>پلن ها</div>
                    </li>
                </Link>
                <Link className="no-underline text-[#676d7c]" to='/dashboard/configs'>
                    <li className="py-1 px-4 m-1 flex items-center hover:rounded-tl-xl hover:rounded-bl-xl hover:text-white hover:bg-blue-400 sm:px-2 md:m-2">
                        <img className="h-6 md:h-7" src={configs} alt='configs'/>

                        <div className={ItemStyle}>کانفیگ ها</div>
                    </li>
                </Link>
                <Link className="no-underline text-[#676d7c]" to='/dashboard/bills'>
                    <li className="py-1 px-4 m-1 flex items-center hover:rounded-tl-xl hover:rounded-bl-xl hover:text-white hover:bg-blue-400 sm:px-2 md:m-2">
                        <img className="h-6 md:h-7" src={payments} alt='payments'/>

                        <div className={ItemStyle}>تراکنش ها</div>
                    </li>
                </Link>
                <Link className="no-underline text-[#676d7c]" to='/dashboard/support'>
                    <li className="py-1 px-4 m-1 flex items-center hover:rounded-tl-xl hover:rounded-bl-xl hover:text-white hover:bg-blue-400 sm:px-2 md:m-2">
                        <img className="h-6 md:h-7" src={payments} alt='payments'/>

                        <div className={ItemStyle}>پشتیبانی</div>
                    </li>
                </Link>
            </ul>
        </div>
        </>
    )
    
};

export default Sidebar;