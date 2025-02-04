import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getOTP } from './services/auth.service';
//styles
import 'react-toastify/dist/ReactToastify.css';

const GetMobile = ({ setState, setLoading }) => {
    const [data, setData] = useState({ mobile: "" });
    const [disabled, setDisabled] = useState(false);

    // Handle input change
    const change = (event) => {
        setData({ ...data, [event.target.name]: event.target.value }); // Fix: Spread existing state
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        try {
            setLoading(true);
            const res = await getOTP(data);
            const { message, mobile, status } = res;

            if (status === 200) {
                setLoading(false);
                setTimeout(() => setState({ sendOTP: true, mobile, message }), 500);
                toast.success(message);
                setDisabled(true);
            }
        } catch (error) {
            setLoading(false);
            setDisabled(false);
        }
    };

    return (
        <div className='w-full p-7 md:p-14 font-[iran-sans] dir-rtl'>
            <h2 className='text-black opacity-60 font-extrabold text-2xl font-iran-sans flex justify-center'>ورود/ثبت نام</h2>
            {/* Wrap the input and button inside a form */}
            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className='flex flex-col mt-14 mb-7'>
                    <label className='font-bold text-base mb-1'>شماره موبایل:</label>
                    <input
                        autoComplete='off'
                        className='w-[250px] lg:min-w-[300px] h-10 rounded py-1 px-2 my-2 border-2 border-[silver] border-solid transition-all delay-100 ease-in placeholder: dir-rtl focus:border-main-blue outline-none '
                        type="tel"
                        placeholder="مثال: 09123456789"
                        value={data.mobile}
                        onChange={change}
                        name='mobile'
                    />
                </div>
                <div className="flex py-3">
                    <button
                        type="submit" // Set button type to "submit" to trigger form submission
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-10 px-4 flex-1 bg-[#359EFF] text-[#FFFFFF] text-sm font-semibold leading-normal tracking-[0.015em]"
                        disabled={disabled}
                    >
                        <span className="truncate">ارسال کد تایید</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GetMobile;