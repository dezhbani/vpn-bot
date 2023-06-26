import React from 'react';
import Bill from './Bill';
import styles from './Bills.module.css';

const Bills = ({bills}) => {
    return (
        <div className={styles.container}>
            {
                bills?.map(bill => <Bill key={bill._id} bill={bill} />)
            }
        </div>
    );
};

export default Bills;