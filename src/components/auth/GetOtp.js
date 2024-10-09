import React,{ useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Timer from '../public/Timer';
import { checkOTP } from './services/auth.service';
import { handleError } from '../public/function';

//style
import 'react-toastify/dist/ReactToastify.css';

const GetOtp = ({state, setLoading, setData}) => {
    const [code, setCode] = useState([]);
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
            const arr = [...code]
            arr[+event.target.name - 1] = event.target.value
            setCode(arr)
        }
    }

    const send = async () =>{
        try {
            setLoading(true)
            const mergedCode = code.join('')
            const res = await checkOTP({
                mobile: state.mobile,
                code: mergedCode
            })
            const { message, status, accessToken } = res;
            if(status == 200){
                setData(res)
                toast.success(message)
                localStorage.setItem("accessToken", accessToken)
                let panelUrl
                if((res.status !== 401) && !res.user.first_name || !res.user.last_name || !res.user.full_name) panelUrl = '/complete-signup' 
                else if(res.user.role == 'customer') panelUrl = '/home'
                else if(['owner', 'admin'].includes(res.user.role)) panelUrl = '/dashboard'
                panelUrl && setTimeout(() => {
                    window.location.href = panelUrl
                    setLoading(false)
                }, 3000)
            }
        } catch (error) {
            handleError()
        }
    }


    return (
        <>
            <h2 className='text-blue-500 font-extrabold text-lg font-[iran-sans] '>ورود/ ثبت نام</h2>
            <div className='flex flex-col my-7'>
                <label className="font-bold mb-1 dir-rtl font-[iran-sans]">کد تایید:</label>
                <div className='flex'>
                    {
                        [1, 2, 3, 4, 5].map((num, index) => <input key={index} onKeyUp={handleKeyPress(index)} ref={(ref) => (inputRefs.current[index] = ref)} className="w-10 h-10 flex justify-center rounded py-1 px-3 my-1 mx-2 text-lg border-[2px] border-solid transition-all delay-200 ease-in focus:border-blue-500 outline-none" minLength="1" maxLength="1" onChange={change} name={num} value={code[num-1]} type="tel" />)
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
