import React, { useEffect, useState } from 'react';
import { addCommaToPrice, timestampToTime, useQuery } from '../../function';
import { useParams } from 'react-router-dom';
import { verifyWalletTransaction } from '../services/payment.service';
import Modal from '../../components/Modal';
import Failed from '../assets/Failed.svg'
import Success from '../assets/Success.svg'

const Invoice = () => {
    const [transaction, setTransaction] = useState({})
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true);

    const query = useQuery();
    const { billID } = useParams();
    const authority = query.get('Authority');
    const verifyWallet = async () => {
        const result = await verifyWalletTransaction(billID, authority)
        if (!(result?.code == 100 || result?.code == 101)) setError(true)
        setTransaction(result)
        setLoading(false)
    };
    useEffect(() => {
        verifyWallet()
    }, [])

    return (
        <>
            <Modal isOpen={loading} loading={loading} />
            {
                !loading && transaction?
                <div className="dir-rtl w-full h-screen bg-[#CFD9E8] flex justify-center items-center">
                    <div className='bg-white h-fit w-3/4 md:w-1/2 lg:w-1/3 shadow-[2px_4px_30px_0px_#00000010] mx-5 rounded-[40px]'>
                        <div className='w-full flex justify-center'>
                            <div className=' bg-white w-fit -translate-y-1/2 rounded-full shadow-[2px_4px_30px_0px_#00000010] p-1'>
                                {

                                    error?
                                        <img className='h-10 md:h-16 p-1.5' src={Failed} alt='Failed' />
                                        : <img className='h-10 md:h-16' src={Success} alt='Success' />
                                }
                            </div>
                        </div>
                        <div className='flex flex-col font-iran-sans'>
                            <span className='flex justify-center my-1 px-10 text-lg md:text-xl font-bold'>{error ? "پرداخت ناموفق!" : "پرداخت موفق!"}</span>
                            <span className='flex justify-center my-1 px-10 text-sm md:text-base'>{transaction.message}</span>
                        </div>
                        {
                            !error && 
                            <hr className='border my-6 mx-10 md:my-10' />
                        }
                        <div className='flex flex-col font-iran-sans mx-10 mb-10'>
                            {
                                !error &&
                                    <ul className="flex w-full flex-col">
                                        <li className="flex items-center justify-between font-semibold border-solid border-gray-300  py-2 text-xs  transition-all last:border-none lg:text-base">
                                            <span className="select-none text-[#707070]">شماره پیگیری</span>
                                            <span className=''>{transaction?.bill?.paymentID?.refID}</span>
                                        </li>
                                        <li className="flex items-center justify-between font-semibold border-solid border-gray-300 py-2 text-xs transition-all last:border-none lg:text-base">
                                            <span className="select-none text-[#707070]">تاریخ</span>
                                            <span className=' dir-ltr '>{timestampToTime(transaction?.bill?.paymentID?.paymentDate)}</span>
                                        </li>
                                        <li className="flex items-center justify-between font-semibold border-solid border-gray-300 py-2 text-xs transition-all last:border-none lg:text-base">
                                            <span className="select-none text-[#707070]">نوع پرداخت</span>
                                            <span className=' '>درگاه بانکی</span>
                                        </li>
                                        <li className="flex items-center justify-between font-semibold border-solid border-gray-300 py-2 text-xs transition-all last:border-none lg:text-base">
                                            <span className="select-none text-[#707070]">توضیحات</span>
                                            <span className=' '>{transaction.bill.for.description}</span>
                                        </li>
                                        <hr className='border-dashed border  my-3 md:my-5' />
                                        <li className="flex items-center justify-between font-semibold border-solid border-gray-300 py-2 text-xs transition-all last:border-none lg:text-base">
                                            <span className="select-none text-[#707070]">مبلغ</span>
                                            <div className='flex '>
                                                <span className='px-1'>{addCommaToPrice((transaction?.bill?.paymentID?.amount / 10))}</span>
                                                <span className='px-1'>تومان</span>
                                            </div>
                                        </li>
                                    </ul>
                            }
                        </div>
                    </div>
                </div>
                : ''
            }
        </>
    );
};

export default Invoice;