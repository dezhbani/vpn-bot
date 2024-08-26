import React, { useEffect, useState } from 'react';
import styles from './Bills.module.css';
import Sidebar from '../public/Sidebar';
import { getBills } from '../../services/profile.service';
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
            <div className={`py-2.5 overflow-scroll w-[calc(85%-5px)] sm:w-3/4 lg:w-5/6 xl:w-[85%]`}>
                {
                    bills?.map(bill => <Bill key={bill._id} bill={bill} />)
                }
            </div>
        </>
    );
};

export default Bills;