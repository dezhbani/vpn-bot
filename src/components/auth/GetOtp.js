import React,{ useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

//style
import 'react-toastify/dist/ReactToastify.css';
import style from './GetOtp.module.css';
import Timer from '../public/Timer';

const GetOtp = ({state}) => {

    const [data, setData] = useState({code: ""});
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});


    useEffect(() =>{
        setErrors({code: !data.code});
    }, [data, touched]);

    const focus = () =>{
        setTouched({ code: true });
    }


    const change = event =>{
        setData({[event.target.name]: event.target.value});
    }

    const send = async () =>{
        if(!data.code){
            setTouched({code: true});
        }else{
            try {
                const res = await axios.post("auth/check-otp",{
                    mobile: state.mobile,
                    code: data.code
                })
                const { message, status, accessToken } = res.data;
                if(status == 200){
                    toast.success(message)
                    localStorage.setItem("accessToken", accessToken)
                }
            } catch (error) {
                toast.error(error.response.data.message, {autoClose: 2000})
            }
        }
    }


    return (
        <div className={style.maincontainer}>
            <div className={style.container}>
                <h2 className={style.header}>ورود/ ثبت نام</h2>
                <div className={style.form}>
                    <label className={style.label}>کد تایید:</label>
                    <input className={(errors.code && touched.code)? style.uncompleted : style.code} minLength="4" maxLength="6" onChange={change} onFocus={focus} name='code' value={data.code} type="text" />
                    <div className={style.timer}>{state.sendOTP? <Timer mobile={state.mobile} /> : ''}</div>
                    <div className={style.button}>
                        <button type="submit" onClick={send}>ورود</button>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default GetOtp;
