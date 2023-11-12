import React from 'react';
import styles from './UserInfo.module.css'
import { editUser } from '../../../services/users.service';

const UserInfo = ({data, setData, user}) => {
    const change = event =>{
        setData({...data, [event.target.name]: event.target.value});
    }
    
    const sendUpdateUser = () =>{
        data._id = user._id
        editUser(data)
    }
    return (
        <div className={styles.mainContainer}>
            <div className={styles.wallet}>
                <img src="https://img.icons8.com/?size=96&id=121758&format=png" alt="Coin Wallet"></img>
                <p>{`اعتبار: ${user.wallet} تومان`}</p>
            </div>
            <div className={styles.userContainer}>
                <div className={styles.userDetails}>
                    <input className={styles.updateUser} type='text' name='first_name' onChange={change} value={data.first_name} />
                    <input className={styles.updateUser} type='text' name='last_name' onChange={change} value={data.last_name} />
                    <input className={styles.updateUser} type='text' name='full_name' onChange={change} value={data.full_name} />
                    <input className={styles.updateUser} type='text' name='mobile' onChange={change} value={data.mobile} />
                    <button className={styles.updateUserBtn} onClick={sendUpdateUser}>ثبت تغییرات</button>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;