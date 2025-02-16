import React, { useContext, useEffect, useRef, useState } from 'react';
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
import menuIcon from '../assets/Menu.svg'
import closeMenuIcon from '../assets/Close.svg'

const Sidebar = () => {
    const [selectedItem, setSelectedItem] = useState('home');
    const [menu, setMenu] = useState(false);
    const user = useContext(ProfileContext)
    const SidebarRef = useRef(null);


    const handleMenu = () => setMenu(!menu)
    const randomBg = () => {
        const randomNumber = Math.floor((Math.random() * 10));
        const randomIndex = randomColor({ luminosity: 'bright', count: 10 })[randomNumber];
        return randomIndex;
    };
    const validateHexColor = (hex) => {
        const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}([A-Fa-f0-9]{2})?$/;
        if (hexRegex.test(hex)) return hex
        return '#0095ff'
    }
    useEffect(() => {
        setSelectedItem(window.location.pathname.split('/')[1])
    }, [])
    const handleClickOutside = (event) => {
        if (SidebarRef.current && !SidebarRef.current.contains(event.target)) {
            setMenu(false);
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
    const ItemStyle = menu ? "pr-2 font-[b-kamran] text-2xl" : "hidden font-[b-kamran] text-2xl sm:flex"

    return (
        <>
            {/* <Navbar /> */}
            <Modal isOpen={!user} loading={!user} />
            <div ref={SidebarRef} className='w-full flex'>
                <div className={`${menu ? 'w-1/2' : 'w-16'} z-50 my-4 mr-4 lg:m-8 rounded-xl shadow-[2px_4px_30px_0px_#00000010] h-[95%] lg:h-[92%] bg-white dir-rtl fixed right-0 float-right sm:w-1/4 lg:w-1/6 xl:w-[15%]`}>
                    <div className='flex flex-col'>
                        <section className={`menu flex items-center justify-center mt-4 mb-2 sm:hidden`}>
                            <button className='w-8 h-8' onClick={handleMenu}>
                                {
                                    menu ?
                                        <img className='-rotate-90 transition-transform duration-200' src={closeMenuIcon} alt='close menu' />
                                        : <img className='-rotate-180 transition-transform duration-200' src={menuIcon} alt='menu' />
                                }
                            </button>
                        </section>
                        <section className={`profile flex ${!menu ? 'max-sm:justify-center' : 'mr-3'} sm:mr-3 items-center w-full float-right dir-rtl my-2 sm:my-5`}>
                            <div style={{ backgroundColor: validateHexColor(bg), color: textColor }} className="flex justify-center items-center rounded-full w-12 h-12">{profileImg()}</div>
                            {
                                menu ?
                                    <p className='font-[iran-sans] font-bold text-xl mr-2'>{user?.full_name}</p>
                                    : <p className='font-[iran-sans] font-bold text-xl mr-2 max-sm:hidden'>{user?.full_name}</p>
                            }
                        </section>
                        <section className='pr-2'>
                            <ul>
                                <Link to='/home'>
                                    <li className={`py-2 px-2 mr-1 my-2 flex items-center relative hover:text-main-blue   ${selectedItem === 'home' && 'text-main-blue'}`} onClick={() => handleItemClick('home')}>
                                        {selectedItem === 'home' && <img src={SelectedIcon} alt="Selected" className='absolute left-0' />}
                                        <img src={HomeIcon} alt="Home" className='ml-2' />
                                        <p className={ItemStyle}>خانه</p>
                                    </li>
                                </Link>
                                <Link to='/plans'>
                                    <li className={`py-2 px-2 mr-1 my-2 flex items-center relative hover:text-main-blue   ${selectedItem === 'plans' && 'text-main-blue'}`} onClick={() => handleItemClick('plans')}>
                                        {selectedItem === 'plans' && <img src={SelectedIcon} alt="Selected" className='absolute left-0' />}
                                        <img src={PlansIcon} alt="Plans" className='ml-2' />
                                        <p className={ItemStyle}>پلن ها</p>
                                    </li>
                                </Link>
                                <Link to='/configs'>
                                    <li className={`py-2 px-2 mr-1 my-2 flex items-center relative hover:text-main-blue   ${selectedItem === 'configs' && 'text-main-blue'}`} onClick={() => handleItemClick('configs')}>
                                        {selectedItem === 'configs' && <img src={SelectedIcon} alt="Selected" className='absolute left-0' />}
                                        <img src={ConfigsIcon} alt="Configs" className='ml-2' />
                                        <p className={ItemStyle}>کانفیگ ها</p>
                                    </li>
                                </Link>
                                <Link to='/bills'>
                                    <li className={`py-2 px-2 mr-1 my-2 flex items-center relative hover:text-main-blue ${selectedItem === 'bills' && 'text-main-blue'}`} onClick={() => handleItemClick('bills')}>
                                        {selectedItem === 'bills' && <img src={SelectedIcon} alt="Selected" className='absolute left-0' />}
                                        <img src={BillsIcon} alt="Bills" className='ml-2' />
                                        <p className={ItemStyle}>فاکتورها</p>
                                    </li>
                                </Link>
                                <li className={`py-2 px-2 mr-1 my-2 flex items-center relative hover:text-main-blue   ${selectedItem === 'support' && 'text-main-blue'}`} onClick={() => handleItemClick('support')}>
                                    {selectedItem === 'support' && <img src={SelectedIcon} alt="Selected" className='absolute left-0' />}
                                    <img src={SupportIcon} alt="Support" className='ml-2' />
                                    <p className={ItemStyle}>پشتیبانی</p>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
                <Navbar menu={menu} />
            </div>
        </>
    );
};

export default Sidebar;
