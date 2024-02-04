import React, { useState } from 'react';
import { addConfig } from '../../services/config.service';
import Modal from '../../public/components/Modal';
import card from '../assets/card.svg';
import wallet from '../assets/Wallet.svg';

const BuyConfig = ({plan, setOpen, open}) => {
    const [data, setData] = useState({})
    const handleClose = () => setOpen(false);
    const change = event =>{
        setData({...data, [event.target.name]: event.target.value});
    }
    const sendData = async event =>{
        data.planID = plan._id;
        data.payType = event.target.name;
        const result = await addConfig(data);
        console.log(result);
        if(result?.gatewayURL) document.location.href = result?.gatewayURL
    }
    return (
        <Modal isOpen={open} onClose={handleClose}>
            <div className='w-full flex justify-center'>
                <div className='w-fit flex flex-col'>
                    <input onChange={change} name='full_name' placeholder='نام و نام خانوادگی فارسی' type='text' className='appearance-none my-1 border border-gray-500 rounded w-52 py-2 px-3 text-lg text-black mb-3 leading-tight focus:border-blue-500 focus:outline-none focus:shadow-outline'/>  
                    <input onChange={change} name='first_name' placeholder='نام لاتین' type='text' className='appearance-none my-1 border border-gray-500 rounded w-52 py-2 px-3 text-lg text-black mb-3 leading-tight focus:border-blue-500 focus:outline-none focus:shadow-outline'/>  
                    <input onChange={change} name='last_name' placeholder='نام خانوادگی لاتین' type='text' className='appearance-none my-1 border border-gray-500 rounded w-52 py-2 px-3 text-lg text-black mb-3 leading-tight focus:border-blue-500 focus:outline-none focus:shadow-outline'/>  
                    <input onChange={change} name='mobile' placeholder='موبایل' type='text' className='appearance-none my-1 border border-gray-500 rounded w-52 py-2 px-3 text-lg text-black mb-3 leading-tight focus:border-blue-500 focus:outline-none focus:shadow-outline'/>  
                </div>
            </div>
            <div className='flex my-3'>
                <button className='flex transition-all duration-500 items-center py-1 px-5 hover:bg-blue-100 rounded' name='مستقیم' onClick={sendData}>پرداخت مستقیم <img className='mx-1 h-7' alt='pay from card' src={card} /></button>
                <button className='flex transition-all duration-500 items-center py-1 px-5 hover:bg-blue-100 rounded' name='اعتبار' onClick={sendData}>پرداخت از اعتبار <img className='mx-1 h-7' alt='pay from wallet' src={wallet} /></button>
            </div>
        </Modal>             
    );
};

export default BuyConfig;