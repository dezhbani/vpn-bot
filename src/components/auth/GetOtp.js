import React,{ useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

//style
import 'react-toastify/dist/ReactToastify.css';
import Timer from '../public/Timer';
import { copyElement } from '../public/function';
import { ProfileContext } from '../context/UserProfileContext';
import { Navigate } from 'react-router-dom';

const GetOtp = ({state, loading, setLoading}) => {
    const userdata = useContext(ProfileContext)
    const [data, setData] = useState([]);
    const inputRefs = useRef([]); 
    const handleKeyPress = index => e => {       
        console.log(e.key);   
        let nextIndex = null
        if(!isNaN(+e.key)){
            if(!isNaN(+e.key) && index + 1 < 6) nextIndex = index + 1
            if(nextIndex < 5 && nextIndex >=0) inputRefs.current[nextIndex].focus();                  
        }
    };

    const change = event =>{
        if(!isNaN(+event.target.value)){
            const arr = [...data]
            arr[+event.target.name - 1] = event.target.value
            setData(arr)
        }
    }

    const send = async () =>{
        try {
            const code = data.join('')
            const res = await axios.post("auth/check-otp",{
                mobile: state.mobile,
                code
            })
            const { message, status, accessToken } = res.data;
            if(status == 200){
                toast.success(message)
                localStorage.setItem("accessToken", accessToken)
                let panelUrl
                if(userdata.role == 'customer') panelUrl = '/profile'
                else if(['owner', 'admin'].includes(userdata.role)) panelUrl = '/dashboard'
                panelUrl && setTimeout(() => window.location.href = panelUrl, 5000)
            }
        } catch (error) {
            toast.error(error.response.data.message, {autoClose: 2000})
        }
    }


    return (
        <>
            <h2 className='text-blue-500 font-extrabold text-lg font-[iran-sans] '>ورود/ ثبت نام</h2>
            <div className='flex flex-col my-7'>
                <label className="font-bold mb-1 dir-rtl font-[iran-sans]">کد تایید:</label>
                <div className='flex'>
                    {
                        [1, 2, 3, 4, 5].map((num, index) => <input key={index} onKeyUp={handleKeyPress(index)} ref={(ref) => (inputRefs.current[index] = ref)} className="w-10 h-10 flex justify-center rounded py-1 px-3 my-1 mx-2 text-lg border-[2px] border-solid transition-all delay-200 ease-in focus:border-blue-500 outline-none" minLength="1" maxLength="1" onChange={change} name={num} value={data[num-1]} type="tel" />)
                    }
                </div>
                <div className='flex w-full justify-center cursor-pointer'>{state.sendOTP && <Timer mobile={state.mobile} />}</div>
                <div className="flex justify-center items-center mt-12">
                    <button className='font-[iran-sans] bg-blue-500 py-2 px-14 text-white rounded text-base' type="submit" onClick={send}>ورود</button>
                </div>
            </div>
        </>
    );
};

export default GetOtp;
