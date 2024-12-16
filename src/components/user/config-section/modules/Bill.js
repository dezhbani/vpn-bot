import React from 'react';
import { addCommaToPrice, timestampToTime } from '../../../public/function';
import Tooltip from '../../../public/components/Tooltip';

const Bill = ({ bill }) => {
    console.log(bill);

    return (
        <div className='flex w-full dir-ltr justify-between items-center p-2 my-4 min-w-[650px]'>
            <div className='w-1/4 '>{timestampToTime(bill.buy_date, true)}</div>
            <div className='w-1/4 dir-rtl  flex justify-center'>{addCommaToPrice(bill.price)} تومان</div>
            <div className='w-1/4 flex justify-center'>
                <span className={`w-fit px-5 py-0.5 rounded-full flex justify-center ${bill.up == null ? 'bg-main-blue/10 text-main-blue' : (bill.up? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500')}`}>
                    {bill.up == null ? 'نامشخص' : (bill.up ? 'برداشت' : 'واریز')}
                </span>
            </div>
            <div className='w-1/4 dir-rtl'>{bill.for.description}</div>
        </div>
    );
};

export default Bill;