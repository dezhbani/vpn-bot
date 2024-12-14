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
        <div className="flex flex-col h-fit md:flex-row items-center justify-center flex-wrap dir-ltr font-iran-sans bg-white shadow-[2px_4px_30px_0px_#00000010] rounded-2xl w-full min-h-20 my-4 p-6 space-y-4">
            <div className='max-lg:w-full lg:w-1/4 text-base font-semibold text-gray-700 text-center md:text-left'>
                {config.name}
            </div>
            <div className='max-lg:w-full lg:w-1/4 flex justify-center items-center text-center md:text-left'>
                {
                    daysLeft() > 0 && <span className='text-xs dir-rtl pr-5 opacity-60 max-w-24 min-w-24 text-gray-600'>
                    <Typewriter
                        options={{
                            strings: [`${daysLeft()} روز دیگر منقضی می شود`],
                            autoStart: true,
                            pauseFor: 1000,
                            cursor: '',
                            delay: 50,
                            deleteSpeed: Infinity
                        }}
                    />
                </span>
                }
                <Status status={config.status} />
            </div>
            <div className='max-lg:w-full lg:w-2/6 flex flex-col items-center'>
                <div className='bg-gray-200 h-2 rounded-full flex items-center dir-ltr w-full mt-2'>
                    <div
                        style={{
                            width: `${percentDataUsege()}%`,
                            backgroundColor: `${percentDataUsege() === 100 ? '#f06363' : '#63aef0'}`
                        }}
                        className='h-full rounded-full transition-all duration-300 ease-in-out'>
                    </div>
                </div>
                <span className='flex justify-start text-xs mt-2 w-full text-gray-600'>
                    {`${clculateData(config.data?.up + config.data?.down)}/${clculateData(config.data?.total)}`}
                </span>
            </div>
            <div className='max-lg:w-full lg:w-1/6 min-w-36 flex justify-around'>
                <div className='relative flex justify-center dir-rtl'>
                    <img
                        className='p-1 w-7 h-7 cursor-pointer hover:scale-110 transition-transform duration-200'
                        src={Copy}
                        alt='Copy'
                        onClick={() => handleCopy(config.config_content, "کانفیگ کپی شد")}
                    />
                    {hoverConfig && (
                        <span className='absolute right-10 -bottom-8 bg-gray-100 p-3 rounded-lg shadow-lg text-sm z-10'>
                            <h1 className='pb-3 font-bold'>کانفیگ:</h1>
                            <QRCode
                                value={config.config_content}
                                size={200}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="H"
                            />
                        </span>
                    )}
                </div>
                <div className='relative flex justify-center dir-rtl'>
                    <img
                        className='p-1 w-7 h-7 cursor-pointer hover:scale-110 transition-transform duration-200'
                        src={Subscription}
                        alt='Subscription'
                        onClick={() => handleCopy(config.subscriptionLink, "لینک سابسکریپشن کپی شد")}
                    />
                    {hoverLink && (
                        <span className='absolute right-10 bg-gray-100 p-3 rounded-lg shadow-lg text-sm z-10'>
                            <h1 className='pb-3 font-bold'>لینک:</h1>
                            <QRCode
                                value={config.subscriptionLink}
                                size={200}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="H"
                            />
                        </span>
                    )}
                </div>
                <Link to={`/configs/${config.configID}`} className='hover:scale-110 transition-transform duration-200'>
                    <img className='p-1 w-7 h-7 cursor-pointer' src={Info} alt='Info' />
                </Link>
            </div>
        </div>
    );
};

export default Config;