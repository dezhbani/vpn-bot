import React, { useEffect, useState } from 'react';
import styles from './Bills.module.css';
import Sidebar from '../public/Sidebar';
import { getBills } from '../../services/profile.service';
import Transaction from '../user-section/details/Transaction';
import Bill from './Bill';

const Bills = () => {
    const [bills, setBills] = useState([]);
    useEffect(() => {
        const allUsers = async () => {
            const allBills = await getBills()
            setBills(allBills)
        }
        allUsers()
        document.title = 'dashboard';
    }, []);
    return (
        <>
            <Sidebar />
            <div>
                {
                    bills?.map(bill => <Bill bill={bill} />)
                }
            </div>
        </>
    );
};

export default Bills;