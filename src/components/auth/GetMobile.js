import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getOTP } from './services/auth.service';

//styles
import 'react-toastify/dist/ReactToastify.css';

const GetMobile = ({setState, loading, setLoading}) => {
    const [data, setData] = useState({mobile: ""});
    const [disabled, setDisabled] = useState(false);

    const change = event =>{
        setData({[event.target.name]: event.target.value});
    }

    const clicked = async () =>{
        try {
            setLoading(true)
            const res = await getOTP(data)
            console.log(res);
            const { message, mobile, status } = res;
            if(status == 200){
                setLoading(false)
                setTimeout(() => setState({sendOTP: true, mobile, message}), 500);
                toast.success(message)
                setDisabled(true)
            }
        } catch (error) {
            setLoading(false)
            setDisabled(false)
        }
    }

    return (
        <>
            <h2 className='text-blue-500 font-extrabold text-lg font-[iran-sans] '>ورود / ثبت نام</h2>
            <div className='flex flex-col my-7'>
                <label className='font-bold mb-1 dir-rtl font-[iran-sans]'>شماره تلفن:</label>
                <input className='w-[250px] h-10 rounded py-1 px-2 my-1 mx-2 border-[2px] border-[silver] border-solid transition-all delay-200 ease-in focus:border-blue-500 outline-none ' type="tel" placeholder="مثال: 09123456789" value={data.mobile} onChange={change} name='mobile'  />
            </div>
            <div className='flex justify-center items-center mt-12'>
                <button disabled={disabled} className={disabled?'font-[iran-sans] bg-blue-200 py-2 px-14 text-white rounded text-base': 'font-[iran-sans] bg-blue-500 py-2 px-14 text-white rounded text-base transition-all delay-100 ease-in hover:bg-blue-400'} onClick={clicked} type="submit">تایید</button>
            </div>
        </>
    );
};

export default GetMobile;