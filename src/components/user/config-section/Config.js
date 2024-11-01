import React, { useState } from 'react';
import { clculateData, handleMessage } from '../../public/function';
import Status from './Status';
import Typewriter from 'typewriter-effect';
import Subscription from '../assets/Subscription.svg'
import Info from '../assets/Info.svg'
import Copy from '../assets/Copy.svg'
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';

const Config = ({ config }) => {
    const [hoverConfig, setHoverConfig] = useState(false);
    const [hoverLink, setHoverLink] = useState(false);

    const percentDataUsege = () => {
        const usage = config.data.up + config.data.down
        const percentage = Math.floor((usage / config.data.total) * 100)
        console.log(`${percentage} %`);

        return percentage
    }
    const daysLeft = () => {
        const currentDate = new Date();
        const targetDateObj = new Date(config.expiry_date);

        // Calculate the difference in time
        const timeDifference = targetDateObj - currentDate;

        // Convert time difference from milliseconds to days
        const daysLeft = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        return daysLeft
    };
    const handleCopy = (value, message) => {
        handleMessage({ message })
        navigator.clipboard.writeText(value)
    }
    // const handleCopy = async 
    return (
        <div className="flex items-center dir-ltr font-iran-sans bg-[#fff] dark:bg-red-500 shadow-[2px_4px_30px_0px_#00000010] rounded-2xl w-full min-h-20 my-2 px-5 [&>*]:p-4">
            <div className='w-1/4'>{config.name}</div>
            <div className='w-1/4 flex justify-center items-center'>
                <span className='text-xs dir-rtl pr-5 opacity-60 max-w-24 min-w-24'>
                    <Typewriter
                        options={{
                            strings: [`${daysLeft()} روز دیگر منقضی می شود`], // Use an array to pass the string
                            autoStart: true,
                            pauseFor: 1000,
                            cursor: '',
                            delay: 50,
                            deleteSpeed: Infinity
                        }}
                    />
                </span>
                <Status status={config.status} />
            </div>
            <div className='w-2/6 flex flex-col items-center px-4'>
                <div className='bg-gray-200 h-2 rounded-full flex items-center dir-ltr w-full  mt-2'>
                    <div style={{ width: `${percentDataUsege()}%`, backgroundColor: `${percentDataUsege() == 100 ? '#f06363' : '#63aef0'}` }} className={`h-full rounded-full`}></div>
                </div>
                <span className='flex justify-start text-xs mt-2 w-full'>{`${clculateData(config.data?.up + config.data?.down)}/${clculateData(config.data?.total)}`}</span>
            </div>
            <div className='w-1/6 flex justify-around'>
                <div className='p-2'>
                    <div className='relative flex justify-center dir-rtl' onMouseEnter={() => setHoverConfig(true)} onMouseLeave={() => setHoverConfig(false)}>
                        <img className='p-1 cursor-pointer' src={Copy} alt='Copy' onClick={() => handleCopy(config.config_content, "کانفیگ کپی شد")} />
                        {hoverConfig && (
                            <span className='absolute right-10 bg-gray-100 p-3 rounded-lg shadow-lg text-md z-10'>
                                <h1 className='pb-3 font-bold'>کانفیگ:</h1>
                                <QRCode
                                    value={config.config_content}
                                    size={200}  // Size of the QR code
                                    bgColor="#ffffff"  // Background color
                                    fgColor="#000000"  // Foreground color
                                    level="H"  // Error correction level
                                />
                            </span>
                        )}
                    </div>
                </div>
                <div className='p-2'>
                    <div className='relative flex justify-center dir-rtl' onMouseEnter={() => setHoverLink(true)} onMouseLeave={() => setHoverLink(false)}>
                        <img className='p-1 cursor-pointer' src={Subscription} alt='Subscription' onClick={() => handleCopy(config.subscriptionLink, "لینک سابسکریپشن کپی شد")} />
                        {hoverLink && (
                            <span className='absolute right-10 bg-gray-100 p-3 rounded-lg shadow-lg text-md z-10'>
                                <h1 className='pb-3 font-bold'>لینک:</h1>
                                <QRCode
                                    value={config.subscriptionLink}
                                    size={200}  // Size of the QR code
                                    bgColor="#ffffff"  // Background color
                                    fgColor="#000000"  // Foreground color
                                    level="H"  // Error correction level
                                />
                            </span>
                        )}
                    </div>
                </div>
                <Link className='p-2' to={`/configs/${config.configID}`}>
                    <img className='p-1 cursor-pointer' src={Info} alt='Info' />
                </Link>
            </div>
        </div>
    );
};

export default Config;