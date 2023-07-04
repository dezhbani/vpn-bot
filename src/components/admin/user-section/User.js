import React from 'react';
import profile from '../assets/profile.png';
import styles from './User.module.css';
import { Link } from 'react-router-dom';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';

const User = ({users, editedID}) => {
    console.log(editedID);
    const lastPlan = users.bills.pop()
    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.imageContainer}>
                    < img className={styles.image} src={profile} />
                </div>
                <Link style={{textDecoration: 'none'}} to={`/dashboard/users/${users._id}`}>
                    <div className={styles.profile}>
                        <div className={styles.profileContainer}>
                            <div className={styles.name}>نام:<span> {`${users.first_name} ${users.last_name}`}</span></div>
                            <div className={styles.mobile}>موبایل: {`${users.mobile}`}</div>
                            <div>{lastPlan?.planID? `بسته فعلی: ${lastPlan.planID.name}`:'بسته ای خریداری نشده'}</div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default User;