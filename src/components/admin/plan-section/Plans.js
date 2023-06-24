import React, { useEffect, useState } from 'react';
import { getPlans } from '../services/plan.service';
import Plan from './PlanDetails';
import styles from './Plans.module.css'
import Sidebar from '../public/Sidebar';
import PlanGuide from '../plan-section/PlanGuide';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    useEffect(() => {
        const allPlans = async () => {
            setPlans(await getPlans())
        }
        allPlans()
        document.title = 'dashboard';
    }, [])
    return (
        <>
        <Sidebar />
        <PlanGuide />
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                {
                    plans.map(plan => <Plan key={plan._id} data={plan}/>)
                }
            </div>
        </div>
        </>
    );
};

export default Plans;