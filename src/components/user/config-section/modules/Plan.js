import React from 'react';
import { addCommaToPrice } from '../../../public/function';

const PlanGuide = () => {
    return (
        <div className='dir-rtl flex mb-7 bg-gray-100 py-2 rounded-lg'>
            <div className='w-1/5 flex justify-center'>نام پلن</div>
            <div className='w-1/5 flex justify-center'>حجم</div>
            <div className='w-1/5 flex justify-center'>تعداد کاربر</div>
            <div className='w-1/5 flex justify-center'>زمان</div>
            <div className='w-1/5 flex justify-center'>مبلغ</div>
        </div>
    );
};
const Plan = ({ plan }) => {
    return (
        <>
            <PlanGuide />
            <div className='dir-rtl flex mt-7'>
                <div className='w-1/5 flex justify-center'>{plan?.name}</div>
                <div className='w-1/5 flex justify-center'>{plan?.data_size} گیگ</div>
                <div className='w-1/5 flex justify-center'>{plan?.user_count == 0? 'بدون محدودیت کاربر': `${plan?.user_count} کاربره`} </div>
                <div className='w-1/5 flex justify-center'>{plan?.month == 1 ? 'یک ماهه' : `${plan?.month} ماهه`}</div>
                <div className='w-1/5 flex justify-center'>{addCommaToPrice(plan?.price)} تومان</div>
            </div>
        </>
    );
};

export default Plan;