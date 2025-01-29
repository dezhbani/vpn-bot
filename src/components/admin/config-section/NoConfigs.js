import React from 'react';
import emptyBox from '../assets/empty-box.png';
import Add from '../assets/Add.svg';
import { Link } from 'react-router-dom';

const NoConfigs = () => {
    return (
        // <div className='h-[50vh] w-full'>
            <div className='w-full h-[50vh] flex justify-center items-center'>
                <div className='flex flex-col w-[40%]'>
                    <div className='justify-center flex'>
                        <img className="h-24" src={emptyBox} alt='empty box' />
                    </div>
                    <div className='flex justify-center mt-4'>
                        <div className='w-fit text-sm font-bold'>
                            <div className='flex justify-center'>هیچ کانفیگی ثبت نکردید</div>
                            <Link to='/dashboard/plans'><button className='bg-blue-400 text-white flex p-2 rounded-md mt-5'>همین الان فروشت رو شروع کن<img className='pr-1 font-extrabold' src={Add}/></button></Link>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default NoConfigs;
