import React, { useState } from 'react';
import { addCommaToPrice } from '../../public/function';
import TickIcon from '../assets/Tick.svg'
import PriceIcon from '../assets/Price.svg'

const Plan = ({ plan }) => {
    const [click, setClick] = useState(false)
    return (
        <div className="flex flex-col justify-around font-iran-sans bg-[#fff] dark:bg-red-500 shadow-[2px_4px_30px_0px_#00000010] rounded-2xl border-gray-300 hover:border-main-blue hover:border-2 border border-opacity-70 duration-100 w-92 max-h-[34rem] min-h-[34rem] m-5 p-10">
            <div className="flex flex-col h-20">
                {
                    click && <p className="flex text-sm text-main-blue w-fit bg-main-blue/10 px-2 py-1 rounded-full">محبوب ترین</p>
                }
                <h3 className="flex w-full h-full items-end justify-center text-dark-blue px-4 py-1 rounded-full text-lg font-bold">{plan.name}</h3>
            </div>
            <ul role="list" className='dir-rtl my-5'>
                <li className="flex items-center mb-7">
                    <img src={TickIcon} className='mx-1' />
                    {plan.data_size == 0 ? "حجم نامحدود" : `${plan.data_size} گیگ`}
                </li>
                <li className="flex items-center my-7">
                    <img src={TickIcon} className='mx-1' />
                    {plan.user_count == 0 ? "بدون محدودیت کاربر" : `${plan.user_count} کاربره`}
                </li>
                <li className="flex items-center my-7">
                    <img src={TickIcon} className='mx-1' />
                    {plan.month} ماهه
                </li>
                <li className="flex items-center mt-7">
                    <img src={TickIcon} className='mx-1' />
                    پشتیبانی تا آخرین روز
                </li>
            </ul>
            <div className='my-7 flex items-center font-bold text-lg'>
                <img className='h-7 ml-5 mr-1' src={PriceIcon} />
                <p className='flex justify-center'>{addCommaToPrice(plan.price)} ت</p>
            </div>
            <div className='flex'>
                <button onClick={() => setClick(!click)} className='bg-main-blue flex items-center justify-center hover:bg-blue-900 duration-500 w-full p-1 rounded text-white font-iran-sans text-lg'>خرید پلن</button>
            </div>
        </div>

    );
};

export default Plan;