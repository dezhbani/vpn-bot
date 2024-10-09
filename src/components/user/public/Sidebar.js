import React, { useContext, useState } from 'react';
import chroma from 'chroma-js';
import randomColor from 'randomcolor';
import HomeIcon from '../assets/Home.svg';
import ConfigsIcon from '../assets/Configs.svg';
import PlansIcon from '../assets/Plans.svg';
import BillsIcon from '../assets/Bills.svg';
import SupportIcon from '../assets/Support.svg';
import SelectedIcon from '../assets/Selected.svg'; // Import the icon you want to show when selected
import Modal from '../../public/components/Modal';
import { ProfileContext } from '../../context/UserProfileContext';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const Sidebar = () => {
    const [selectedItem, setSelectedItem] = useState('home');
    const user = useContext(ProfileContext)
    
    const randomBg = () => {
        const randomNumber = Math.floor((Math.random() * 10));
        const randomIndex = randomColor({ luminosity: 'bright', count: 10 })[randomNumber];
        return randomIndex;
    };

    const backgroundColor = randomBg();
    const bg = localStorage.getItem('bg') || backgroundColor;
    if (!localStorage.getItem('bg')) localStorage.setItem('bg', backgroundColor);

    const profileImg = () => {
        const splitedFirstName = user?.first_name.split('')[0];
        const splitedLastName = user?.last_name.split('')[0];
        const result = splitedFirstName?.toLocaleUpperCase() + splitedLastName?.toLocaleUpperCase();
        return result;
    };

    const textColor = chroma(bg).luminance() > 0.5 ? 'black' : 'white';

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    return (
        <>
            {/* <Navbar /> */}
            <Modal isOpen={!user} loading={!user}/>
            <div className='w-full flex'>
                <div className={`${true ? 'w-1/2' : 'w-[4.5rem]'} z-50 m-8 rounded-xl shadow-[2px_4px_30px_0px_#00000010] h-[92%] bg-white  dir-rtl fixed right-0 float-right sm:w-1/4 lg:w-1/6 xl:w-[15%]`}>
                    <div className='py-2 pr-2 flex flex-col'>
                        <section className='profile flex items-center float-right dir-rtl my-5'>
                            <div style={{ backgroundColor: bg, color: textColor }} className="p-4 rounded-full w-fit mx-2">{profileImg()}</div>
                            <p className=' font-[iran-sans] font-bold text-xl'>{user?.full_name}</p>
                        </section>
                        <section className='my-4'>
                            <ul>
                                <Link to='/home'>
                                    <li className={`py-2 px-2 mr-1 my-2 flex items-center relative hover:text-main-blue   ${selectedItem === 'home' && 'text-main-blue'}`} onClick={() => handleItemClick('home')}>
                                            {selectedItem === 'home' && <img src={SelectedIcon} alt="Selected" className='absolute left-0' />}
                                            <img src={HomeIcon} alt="Home" className='ml-2' />
                                            <p className='pr-2 font-[b-kamran] text-2xl'>خانه</p>
                                    </li>
                                </Link>
                                <li className={`py-2 px-2 mr-1 my-2 flex items-center relative hover:text-main-blue   ${selectedItem === 'plans' && 'text-main-blue'}`} onClick={() => handleItemClick('plans')}>
                                    {selectedItem === 'plans' && <img src={SelectedIcon} alt="Selected" className='absolute left-0' />}
                                    <img src={PlansIcon} alt="Plans" className='ml-2' />
                                    <p className='pr-2 font-[b-kamran] text-2xl'>پلن ها</p>
                                </li>
                                <li className={`py-2 px-2 mr-1 my-2 flex items-center relative hover:text-main-blue   ${selectedItem === 'configs' && 'text-main-blue'}`} onClick={() => handleItemClick('configs')}>
                                    {selectedItem === 'configs' && <img src={SelectedIcon} alt="Selected" className='absolute left-0' />}
                                    <img src={ConfigsIcon} alt="Configs" className='ml-2' />
                                    <p className='pr-2 font-[b-kamran] text-2xl'>کانفیگ ها</p>
                                </li>
                                <li className={`py-2 px-2 mr-1 my-2 flex items-center relative hover:text-main-blue ${selectedItem === 'bills' && 'text-main-blue'}`} onClick={() => handleItemClick('bills')}>
                                    {selectedItem === 'bills' && <img src={SelectedIcon} alt="Selected" className='absolute left-0' />}
                                    <img src={BillsIcon} alt="Bills" className='ml-2' />
                                    <p className='pr-2 font-[b-kamran] text-2xl'>فاکتورها</p>
                                </li>
                                <li className={`py-2 px-2 mr-1 my-2 flex items-center relative hover:text-main-blue   ${selectedItem === 'support' && 'text-main-blue'}`} onClick={() => handleItemClick('support')}>
                                    {selectedItem === 'support' && <img src={SelectedIcon} alt="Selected" className='absolute left-0' />}
                                    <img src={SupportIcon} alt="Support" className='ml-2' />
                                    <p className='pr-2 font-[b-kamran] text-2xl'>پشتیبانی</p>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
