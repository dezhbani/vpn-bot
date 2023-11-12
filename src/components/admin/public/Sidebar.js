import React, { useContext } from 'react';
import plans from '../assets/plans.svg'
import users from '../assets/user.svg'
import userProfile from '../assets/profile.png'
import configs from '../assets/configs.svg'
import payments from '../assets/payment.svg'
import home from '../assets/home.svg'
//Styles
import styles from './Sidebar.module.css'
import { Link } from 'react-router-dom';
import { ProfileContext } from '../../context/UserProfileContext';
import Loading from './Loading';

const Sidebar = () => {
    const profile = useContext(ProfileContext)
    if(!profile?.role) return <div className={styles.Loading}><Loading /></div>

    return (
        <div className={styles.main}>
            <div className={styles.profile}>
                <div className={styles.imageContainer}>
                    <img className={styles.profileImage} alt='profile' src={userProfile} />
                    <div className={styles.addImage}/>
                </div>
                <div className={styles.fullname}>{profile.full_name}</div>
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
                <Link className={styles.links} to='/dashboard/bills'>
                    <div className={styles.container}>
                        <img className={styles.icon} src={payments} alt='payments'/>
                        <div className={styles.field}>تراکنش ها</div>
                    </div>
                </Link>
            </div>
        </div>
    )
    
};

export default Sidebar;