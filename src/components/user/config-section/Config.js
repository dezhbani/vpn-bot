import React from 'react';
import { clculateData, timestampToTime } from '../../public/function';
import Status from './Status';
import Typewriter from 'typewriter-effect';

const Config = ({ config }) => {
    console.log(config);
    
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
    return (
        <div className="flex items-center dir-ltr font-iran-sans bg-[#fff] dark:bg-red-500 shadow-[2px_4px_30px_0px_#00000010] rounded-2xl w-full min-h-20 my-2 px-5 [&>*]:p-4">
            <div className='w-1/4'>{config.name}</div>
            <div className='w-1/4 flex justify-center items-center'>
                <span className='text-xs dir-rtl pr-5 opacity-60 max-w-24'>
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
                    <div style={{width: `${percentDataUsege()}%`, backgroundColor: `${percentDataUsege() == 100? '#f06363' : '#63aef0'}`}} className={`h-full rounded-full`}></div>
                </div>
                <span className='flex justify-start text-xs mt-2 w-full'>{`${clculateData(config.data?.up + config.data?.down)}/${clculateData(config.data?.total)}`}</span>
            </div>
            <div className='w-1/6'><span className='text-sm text-main-blue w-fit bg-main-blue/10 px-2 py-1.5 rounded-full flex items-center'>{timestampToTime(config?.expiry_date)}</span></div>
        </div>
    );
};

export default Config;