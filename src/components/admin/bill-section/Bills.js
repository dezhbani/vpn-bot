import React, { useEffect, useState } from 'react';
import styles from './Bills.module.css';
import Sidebar from '../public/Sidebar';
import { getBills } from '../../services/profile.service';
import Transaction from '../user-section/details/Transaction';
import Bill from './Bill';

const Bills = () => {
    const [bills, setBills] = useState([]);
    useEffect(() => {
        const userBills = async () => {
            const allBills = await getBills()
            setBills(allBills)
        }
        userBills()
        document.title = 'dashboard';
    }, []);
    return (
        <>
            <Sidebar />
            <div className={styles.container}>
                {
                    bills?.map(bill => <Bill key={bill._id} bill={bill} />)
                }
            </div>
        </>
    );
};

export default Bills;