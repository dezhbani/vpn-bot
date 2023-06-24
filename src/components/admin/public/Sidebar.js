import React from 'react';
import profile from '../assets/profile.png'
import plans from '../assets/plans.svg'
import users from '../assets/user.svg'
import configs from '../assets/configs.svg'
import payments from '../assets/payment.svg'
import home from '../assets/home.svg'
//Styles
import styles from './Sidebar.module.css'
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className={styles.main}>
            <div className={styles.profile}>
                <div className={styles.imageContainer}>
                    <img className={styles.profileImage} alt='profile' src={profile} />
                    <div className={styles.addImage}/>
                </div>
                <div className={styles.fullname}>matin dezhbani</div>
            </div>
            <div className={styles.fieldsContainer}>
                <Link className={styles.links} to='/dashboard'>
                    <div className={styles.container}>
                        <img className={styles.icon} src={home} alt='home'/>
                        <div className={styles.field}>خانه</div>
                    </div>
                </Link>
                <Link className={styles.links} to='/dashboard/users'>
                    <div className={styles.container}>
                        <img className={styles.icon} src={users} alt='users'/>
                        <div className={styles.field}>کاربران</div>
                    </div>
                </Link>
                <Link className={styles.links} to='/dashboard/plans'>
                    <div className={styles.container}>
                        <img className={styles.icon} src={plans} alt='plans'/>
                        <div className={styles.field}>پلن ها</div>
                    </div>
                </Link>
                <Link className={styles.links} to='/dashboard/configs'>
                    <div className={styles.container}>
                        <img className={styles.icon} src={configs} alt='configs'/>
                        <div className={styles.field}>کانفیگ ها</div>
                    </div>
                </Link>
                <Link className={styles.links} to='/dashboard/payments'>
                    <div className={styles.container}>
                        <img className={styles.icon} src={payments} alt='payments'/>
                        <div className={styles.field}>پرداخت ها</div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;