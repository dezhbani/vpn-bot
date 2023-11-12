import { Modal } from '@mui/material';
import styles from './UserDetails.module.css'
import React, { useState } from 'react';
import UserInfo from './details/UserInfo';
import Transactions from './details/Transactions';

const UserDetails = ({user, setOpen, open}) => {
    const headerSection = ["اطلاعات کاربر", "تراکنش ها", "کانفیگ ها"]
    const [data, setData] = useState({full_name: user.full_name, wallet: user.wallet, first_name: user.first_name, last_name: user.last_name, mobile: user.mobile})
    const [value, setValue] = useState(0)
    const [changed, setChanged] = useState(false)
    const [wallet, setWallet] = useState({wallet: 0})
    const handleClose = () => setOpen(false);
    const handleWallet = () => setWallet(false);
    
    const changeWallet = event =>{
        setWallet({wallet: event.target.value});
    }
    const click = event =>{
        const value = event.target.getAttribute('value')
        setValue(value)
    }
    return (
        <div>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <div className={styles.box}>
                    <div className={styles.header}>
                        {
                            headerSection.map(header => (
                                <div key={headerSection.indexOf(header)} className={`${styles.pageButton} ${headerSection.indexOf(header) == value? styles.activeBtn : styles.deActiveBtn}`} value={headerSection.indexOf(header)} onClick={click}>{header}</div>
                            ))
                        }
                    </div>
                    <div className={styles.container}>
                        <div className={value == 0 ?styles.userInfo: 'hidden'}>
                            <UserInfo data={data} setData={setData} user={user} />
                        </div>
                        <div className={value == 1 ?styles.transactions: 'hidden'}>
                            <Transactions bills={user.bills} />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserDetails;