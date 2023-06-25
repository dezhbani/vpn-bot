import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';

//styles
import 'react-toastify/dist/ReactToastify.css';
import style from'./GetMobile.module.css';

const GetMobile = ({setState}) => {
    const [data, setData] = useState({mobile: ""});
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});


    useEffect(() =>{
        setErrors({mobile: !data.mobile});
        if(!data.mobile && touched.mobile) toast.error("!شماره موبایل نمیتونه خالی باشه")
    }, [data, touched]);

    const focus = event =>{
        setTouched({ ...touched, [event.target.name]: true });
    }

    const change = event =>{
        setData({[event.target.name]: event.target.value});
    }

    const clicked = async () =>{
        if(errors.mobile){
            setTouched({mobile: true});
        }else{ 
        try {
            const res = await axios.post("auth/get-otp",{
                mobile: data.mobile
            });
            const { message, mobile, status } = res.data;
            if(status == 200){
                setTimeout(() => setState({sendOTP: true, mobile, message}), 5500);
                toast.success(message)
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
                <div className={style.formfield}>
                    <label className={style.label}>شماره تلفن:</label>
                    <input className={(touched.mobile && errors.mobile)? style.uncompleted : style.mobile} type="tel" placeholder="مثال: 09123456789" value={data.mobile} onFocus={focus} onChange={change} name='mobile'  />
                </div>
                <div className={style.buttons}>
                    <button onClick={clicked} type="submit">تایید</button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default GetMobile;