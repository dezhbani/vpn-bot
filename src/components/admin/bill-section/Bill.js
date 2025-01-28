import React, { useState } from 'react';
import ReceiptIcon from '../assets/Receipt.svg';
import { AD2solarDate, addCommaToPrice, timestampToTime } from '../../public/function';
import Receipt from './Receipt';

const Bill = ({bill}) => {
    const [ open, setOpen ] = useState(false)
    const handleOpen = () => {
        setOpen(true);
    }
    const payStatus = () => {
        switch (bill.up) {
            case null:
                return <div className="w-28 h-fit my-3 mx-7 text-blue-600 border-2 flex justify-center items-center border-solid border-blue-600 p-1 rounded-md">پرداخت نشده</div>
            case true:
                return <div className="w-28 h-fit my-3 mx-7 text-red-500 border-2 flex justify-center items-center border-solid border-red-500 p-1 rounded-md">برداشت</div>
            case false:
                return <div className="w-28 h-fit my-3 mx-7 text-green-700 border-2 flex justify-center items-center border-solid border-green-700 p-1 rounded-md">واریز</div>
            default:
                return <div className="w-28 h-fit my-3 mx-7 text-gray-500 border-2 flex justify-center items-center border-solid border-gray-500 p-1 rounded-md">نامشخص</div>
        }
    }
    const date = AD2solarDate(bill.buy_date)
    return (
        <div className="flex font-[iran-sans] dir-rtl justify-center my-3">
            <div className='flex max-lg:block justify-center items-center w-[90%] max-lg:w-[95%] bg-slate-50 shadow-md rounded-3xl xl:mx-28 px-10 py-2 shadow-[1px 1px 10px rgb(202, 202, 202)]'>
                <Receipt open={open} setOpen={setOpen} bill={bill} />
                <div className="mx-2 w-[30%] dir-ltr flex justify-center">{timestampToTime(bill.buy_date)}</div>
                <div className="mx-2 w-[25%]">{addCommaToPrice(bill.price)} تومان</div>
                <p className="mx-2 w-[25%]">{bill.for.description}</p>
                <div className='mx-2 w-[20%]'>
                    {
                        payStatus()
                    }
                </div>
                <div onClick={handleOpen} className="px-2 w-[10%] flex justify-center">
                    <img src={ReceiptIcon} alt='Receipt'/>
                </div>
            </div>
        </div>
    );
};

export default Bill;
