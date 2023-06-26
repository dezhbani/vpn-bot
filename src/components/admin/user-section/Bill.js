import React from 'react';
import styles from './Bill.module.css'
import { gregorianToSolar } from 'farvardin';
import { digitsEnToFa } from '@persian-tools/persian-tools';
const Bill = ({bill}) => {
    const date = new Date(bill?.buy_date);
    const IRDate = date.toLocaleDateString('fa-IR')
    const time = digitsEnToFa(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)
    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.name}>{time} {IRDate}</div>
                <div className={styles.name}>{bill?.planID?.name}</div>
                <div className={styles.dataSize}>{bill?.planID?.data_size} گیگ</div>
                <div className={styles.month}>{bill?.planID?.month} ماهه</div>
                <div className={bill?.planID?.user_count == 0?styles.userCount:styles.dataSize}>{bill?.planID?.user_count == 0? "بدون محدودیت کاربر": `${bill?.planID?.user_count} کاربره`}</div>
            </div>
        </div>
    );
};

export default Bill;