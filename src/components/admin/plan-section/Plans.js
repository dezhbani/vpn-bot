import React, { useContext, useEffect, useState } from 'react';
import { getPlans } from '../../services/plan.service';
import Plan from './PlanDetails';
import styles from './Plans.module.css'
import Sidebar from '../public/Sidebar';
import logo from '../assets/delta-vpn-logo.webp'

const Plans = () => {
    const [plans, setPlans] = useState([]);
    useEffect(() => {
        const allPlans = async () => {
            const allPlans = await getPlans()
            setPlans(allPlans)
        }
        allPlans()
        document.title = 'dashboard';
    }, [])
    return (
        <>
        <Sidebar />
        {
            plans?
                <div>
                    <div className={styles.mainContainer}>
                        <div className={styles.container}>
                            {
                                plans?.map(plan => <Plan key={plan._id} data={plan}/>)
                            }
                        </div>
                    </div>
                </div>:
                <div className={styles.logoContainer}>
                    <img src={logo} alt='logo' className={styles.logo} />
                </div>
        }
        </>
    );
};

export default Plans;