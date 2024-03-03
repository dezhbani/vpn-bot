import { Modal } from '@mui/material';
import styles from './UserDetails.module.css'
import React, { useState } from 'react';
import UserInfo from './details/UserInfo';
import Transactions from './details/Transactions';
import Permission from './details/Permission';

const UserDetails = ({user, setOpen, open}) => {
    const headerSection = ["اطلاعات کاربر", "تراکنش ها", "کانفیگ ها"]
    const [data, setData] = useState({full_name: user.full_name, wallet: user.wallet, first_name: user.first_name, last_name: user.last_name, mobile: user.mobile})
    const [value, setValue] = useState(0)
    const handleClose = () => setOpen(false);

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
                        <div className={value == 2 ?styles.transactions: 'hidden'}>
                            <Permission />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserDetails;