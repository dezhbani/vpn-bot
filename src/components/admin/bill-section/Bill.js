import React, { useState } from 'react';
import styles from './Bill.module.css';
import ReceiptIcon from '../assets/Receipt.svg';
import { AD2solarDate, addCommaToPrice, p2eDigits, timestampToTime } from '../../public/function';
import Receipt from './Receipt';

const Bill = ({bill}) => {
    const [ open, setOpen ] = useState(false)
    const handleOpen = () => {
        setOpen(true);
    }
    const date = AD2solarDate(bill.buy_date)
    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <Receipt open={open} setOpen={setOpen} bill={bill} />
                <div className={`${styles.date}`}>{timestampToTime(bill.buy_date)}</div>
                <div className={`${styles.amount}`}>{addCommaToPrice(bill.price)}</div>
                <p className={`${styles.for}`}>{bill.for.description}</p>
                {bill.up == null?
                    <div className={styles.noPay}>پرداخت نشده</div>:
                    (
                        bill.up?
                        <div className={styles.up}>برداشت</div>
                        :<div className={styles.down}>واریز</div>
                    )
                }
                <div onClick={handleOpen} className="flex justify-center items-center">
                    <img className='h-10' src={ReceiptIcon} alt='Receipt'/>
                </div>
            </div>
        </div>
    );
};

export default Bill;