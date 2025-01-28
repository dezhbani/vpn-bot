import React, { useState } from 'react';
import { addConfig } from '../services/config.service';
import Modal from '../../public/components/Modal';
import tick from '../assets/tick.svg';

const BuyConfig = ({plan, setOpen, open}) => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({})
    const handleClose = () => setOpen(false);
    const change = event =>{
        setData({...data, [event.target.name]: event.target.value});
    }
    const sendData = async event =>{
        setLoading(true)
        data.planID = plan._id;
        const result = await addConfig(data);
        setLoading(false)
        if(result) {
            handleClose()
            setData({})
        }
        if(result?.gatewayURL) {
            document.location.href = result?.gatewayURL
        }
    }
    return (
        <Modal isOpen={open} onClose={handleClose} loading={loading}>
            <div className='w-full flex justify-center'>
                <div className='w-fit flex flex-col'>
                    <input onChange={change} name='full_name' value={data.full_name} placeholder='نام و نام خانوادگی فارسی' type='text' className='appearance-none my-1 border border-gray-500 rounded w-72 py-2 px-3 text-lg text-black mb-3 leading-tight focus:border-blue-500 focus:outline-none focus:shadow-outline'/>  
                    <input onChange={change} name='first_name' value={data.first_name} placeholder='نام لاتین' type='text' className='appearance-none my-1 border border-gray-500 rounded w-72 py-2 px-3 text-lg text-black mb-3 leading-tight focus:border-blue-500 focus:outline-none focus:shadow-outline'/>  
                    <input onChange={change} name='last_name' value={data.last_name} placeholder='نام خانوادگی لاتین' type='text' className='appearance-none my-1 border border-gray-500 rounded w-72 py-2 px-3 text-lg text-black mb-3 leading-tight focus:border-blue-500 focus:outline-none focus:shadow-outline'/>  
                    <input onChange={change} name='mobile' value={data.mobile} placeholder='موبایل' type='text' className='appearance-none my-1 border border-gray-500 rounded w-72 py-2 px-3 text-lg text-black mb-3 leading-tight focus:border-blue-500 focus:outline-none focus:shadow-outline'/>  
                </div>
            </div>
            <div className='flex w-full justify-center'>
                <button className='flex transition-all duration-500 items-center py-1 px-3 bg-blue-500 hover:bg-blue-400 rounded-lg text-white font-[b-kamran] text-2xl' onClick={sendData}>ثبت کانفیگ <img className='mr-3 h-7' alt='pay from card' src={tick} /></button>
            </div>
        </Modal>             
    );
};

export default BuyConfig;