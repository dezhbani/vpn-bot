import React, { useState } from 'react';
import styles from './Auth.module.css'
import GetMobile from './GetMobile';
import GetOtp from './GetOtp';

const Auth = () => {

    const [ state, setState ] = useState({sendOTP: false, mobile: ''})

    return (
        <div className={styles.main}>
            <div className={styles.container}>
                {
                    state.sendOTP? <GetOtp state={state} /> : <GetMobile setState={setState} state={state} />

                }
            </div>
        </div>
    );
};

export default Auth;