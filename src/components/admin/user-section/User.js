import React from 'react';
import profile from '../assets/profile.png';
import styles from './User.module.css';

const User = ({data}) => {
    const lastPlan = data.bills.pop()
    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.imageContainer}>
                    <img className={styles.image} src={profile} />
                </div>
                <div className={styles.profile}>
                    <div className={styles.profileContainer}>
                        <div className={styles.name}>نام:<span> {`${data.first_name} ${data.last_name}`}</span></div>
                        <div className={styles.mobile}>موبایل: {`${data.mobile}`}</div>
                        <div>{lastPlan?.planID? `بسته: ${lastPlan.planID.name}`:'بسته ای خریداری نشده'}</div>
                    </div>
                    <div className={styles.buttonContainer}>
                        <button>تمدید کانغیگ</button>
                        <button>ارسال مجدد کانفیگ</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default User;