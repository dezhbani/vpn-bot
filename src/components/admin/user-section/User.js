import React from 'react';
import profile from '../assets/profile.png';
import styles from './User.module.css';
import { Link } from 'react-router-dom';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { lastIndex } from '../../public/function';

const User = ({users, editedID, setEditedID}) => {
    const changeHandler = event =>{
        setEditedID({edit: true, ID: event.target.value})
    }
    const lastPlan = lastIndex(users.bills);
    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                    {editedID.edit ?
                    <div className={styles.radioContainer}>
                        <FormControl>
                            <RadioGroup aria-labelledby="demo-radio-buttons-group-label" defaultValue="female" name="radio-buttons-group" >
                                <FormControlLabel checked={editedID.ID == users._id} onChange={changeHandler} value={users._id} control={<Radio />}/>
                            </RadioGroup>
                        </FormControl>
                    </div>
                    :
                    <div className={styles.imageContainer}>
                        < img alt='profile' className={styles.image} src={profile} />
                    </div>
                    }
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