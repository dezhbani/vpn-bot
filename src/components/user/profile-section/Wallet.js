import React, { useContext, useState } from 'react';
import { ProfileContext } from '../../context/UserProfileContext';
import { addCommaToPrice } from '../../public/function';
import PriceIcon from '../assets/Price.svg';
import { toast } from 'react-toastify';
import { increaseWallet } from '../services/profile.service';
import Modal from '../../public/components/Modal';

const Wallet = () => {
    const [wallet, setWallet] = useState(50000)
    const [loading, setLoading] = useState(false)
    const change = e => {
        setWallet(+e.target.value)
    }
    const plus = () => setWallet(wallet + 1000)
    const minus = () => setWallet(wallet - 1000)
    const pay = async () => {
        if (wallet < 50000) toast.error('حداقل افزایش اعتبار باید بیشتر از 50,000 تومان باشد')
        setLoading(true)
        await increaseWallet({ pay: wallet })
        setLoading(false)
    }
    const user = useContext(ProfileContext);

    return (
        <div>
            <Modal isOpen={loading} loading={loading} />
            <h1 className='w-full text-xl pt-6 pr-6 font-bold'>
                <span className='mx-2 inline-block bg-main-blue rounded-full w-2.5 h-2.5' />
                افزایش اعتبار
            </h1>
            <div className='flex flex-col items-center justify-center h-full text-lg mx-14 my-8 font-iran-sans'>
                <div className='flex items-center my-5'>
                    <span className='flex items-center'>تومان {addCommaToPrice(user.wallet)}</span>
                    <img className='mx-2 h-8' src={PriceIcon} alt='PriceIcon' />
                </div>
                <div className='flex flex-col'>
                    <div className='flex w-fit max-h-10 items-center my-9'>
                        <button className='flex mx-3 px-4 h-10 w-10 justify-center font-bold transform transition duration-300 items-center bg-gray-200 hover:bg-main-blue rounded-lg' onClick={plus}>+</button>
                        <input className={`text-center border-2 h-10 w-52 border-gray-400 rounded-md transform transition duration-500 outline-none py-1 px-2 dir-ltr focus:${wallet < 50000 ? 'border-red-500' : 'border-main-blue'}`} value={wallet} onChange={change} />
                        <button className='flex mx-3 px-4 h-10 w-10 justify-center font-bold transform transition duration-300 items-center bg-gray-200 hover:bg-main-blue rounded-lg' onClick={minus}>-</button>
                    </div>
                    <div className='text-sm'>
                        <span className='text-sm text-[#0050f9] w-fit bg-[#0050f9]/10 px-2 py-0.5 mx-1 rounded-full' onClick={() => setWallet(100000)}>100 هزار تومان</span>
                        <span className='text-sm text-[#0050f9] w-fit bg-[#0050f9]/10 px-2 py-0.5 mx-1 rounded-full' onClick={() => setWallet(200000)}>200 هزار تومان</span>
                        <span className='text-sm text-[#0050f9] w-fit bg-[#0050f9]/10 px-2 py-0.5 mx-1 rounded-full' onClick={() => setWallet(500000)}>500 هزار تومان</span>
                    </div>
                    <div className='flex flex-col justify-center my-5 w-full'>
                        <button className='flex w-full justify-center bg-main-blue text-white px-6 py-1 my-4 rounded-lg' onClick={pay}>پرداخت</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;