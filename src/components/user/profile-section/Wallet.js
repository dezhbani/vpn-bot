import React, { useContext, useState } from 'react';
import { ProfileContext } from '../../context/UserProfileContext';
import { addCommaToPrice } from '../../public/function';
import PriceIcon from '../assets/Price.svg';
import { toast } from 'react-toastify';
import { increaseWallet } from '../services/profile.service';
import Modal from '../../public/components/Modal';

const Wallet = () => {
    const [wallet, setWallet] = useState("50000"); 
    const [loading, setLoading] = useState(false);
    const removeCommas = (value) => {
        return value.replace(/,/g, ""); 
    };
    const change = (e) => {
        const inputValue = e.target.value;
        const numericValue = removeCommas(inputValue);
        if (/^\d*$/.test(numericValue) || numericValue === "") {
            setWallet(numericValue); 
        }
    };
    const getDisplayValue = () => {
        return addCommaToPrice(wallet);
    };

    const pay = async () => {
        if (+wallet < 50000) return toast.error('حداقل افزایش اعتبار باید بیشتر از 50,000 تومان باشد')
        setLoading(true)
        const result = await increaseWallet({ pay: wallet })
        if(result) window.open(result.gatewayURL, "_blank")
        setLoading(false)
    }
    const user = useContext(ProfileContext);

    return (
        <div>
            <Modal isOpen={loading} loading={loading} />
            <h1 className='flex py-5 font-bold text-lg sm:text-xl max-sm:justify-start items-center max-sm:w-full'>
                <span className='mx-2 inline-block bg-main-blue rounded-full w-2.5 h-2.5' />
                افزایش اعتبار
            </h1>
            <div className='flex flex-col items-center justify-center h-full text-lg sm:mx-14 my-8 font-iran-sans'>
                <div className='flex items-center my-5'>
                    <span className='flex items-center'>تومان {addCommaToPrice(user.wallet)}</span>
                    <img className='mx-2 h-8' src={PriceIcon} alt='PriceIcon' />
                </div>
                <div className='flex flex-col'>
                    <div className='flex w-full max-h-10 items-center my-9'>
                        <input type='text' className={`text-center border-2 h-10 w-full border-gray-400 rounded-md transform transition duration-500 outline-none py-1 px-2 dir-ltr focus:${wallet < 50000 ? 'border-red-500' : 'border-main-blue'}`} value={getDisplayValue()} onChange={change} />
                    </div>
                    <div className='text-sm overflow-x-auto min-w-full flex flex-wrap'>
                        <span className='text-sm text-[#0050f9] w-fit bg-[#0050f9]/10 px-2 py-0.5 m-1 rounded-full' onClick={() => setWallet("100000")}>100 هزار تومان</span>
                        <span className='text-sm text-[#0050f9] w-fit bg-[#0050f9]/10 px-2 py-0.5 m-1 rounded-full' onClick={() => setWallet("200000")}>200 هزار تومان</span>
                        <span className='text-sm text-[#0050f9] w-fit bg-[#0050f9]/10 px-2 py-0.5 m-1 rounded-full' onClick={() => setWallet("500000")}>500 هزار تومان</span>
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