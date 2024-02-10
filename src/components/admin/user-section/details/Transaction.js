import React from 'react';
import styles from './Transaction.module.css';
import { AD2solarDate, addCommaToPrice, p2eDigits } from '../../../public/function';

const Transaction = ({bill}) => {
    const date = AD2solarDate(bill.buy_date)
    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={`${styles.date}`}>{p2eDigits(date)}</div>
                <div className={`${styles.amount}`}>{addCommaToPrice(bill.price)}</div>
                {/* {bill.up?
                <div className={styles.amountUp}>{`- ${bill.price}`}</div>
                :
                <div className={styles.amountDown}>{`+ ${bill.price}`}</div>
                } */}
                <p className={`${styles.for}`}>{bill.for.description}</p>
                {bill.up?
                    <div className={styles.up}>برداشت</div>
                    :<div className={styles.down}>واریز</div>
                }
            </div>
        </div>
    );
};

export default Transaction;