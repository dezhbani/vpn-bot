import React from 'react';
import Transaction from './Transaction';
import styles from './Transactions.module.css';

const Transactions = ({bills}) => {
    console.log(bills);
    return (
        <div className={styles.container}>
            {
                bills.map(bill => (
                    <Transaction key={bill._id} bill={bill} />
                ))
            }
        </div>
    );
};

export default Transactions;