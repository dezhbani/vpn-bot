import styles from './PlanGuide.module.css'
import React from 'react';
import AddPlan from './AddPlan';



const PlanGuide = () => {
    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <AddPlan />
                <div className={styles.planContainer}>
                    <div className={styles.name}>نام پلن</div>
                    <div className={styles.dataSize}>حجم</div>
                    <div className={styles.month}>مدت زمان(ماه)</div>
                    <div className={styles.userCount}>تعداد کاربر</div>
                </div>
            </div>
        </div>
    );
};

export default PlanGuide;