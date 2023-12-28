import React, { useContext, useState } from 'react';
import plans from '../assets/plans.svg'
import users from '../assets/user.svg'
import userProfile from '../assets/profile.png'
import configs from '../assets/configs.svg'
import payments from '../assets/payment.svg'
import home from '../assets/home.svg'
import wallet from '../assets/Wallet.svg'
//Styles
import styles from './Sidebar.module.css'
import { Link } from 'react-router-dom';
import { ProfileContext } from '../../context/UserProfileContext';
import Loading from './Loading';
import { addCommaToPrice } from '../../public/function';
import UpdateWallet from '../payment-section/UpdateWallet';

const Sidebar = () => {
    const [ open, setOpen ] = useState(false)
    const handleOpen = () => setOpen(true);
    const profile = useContext(ProfileContext)
    if(!profile?.role) return <div className={styles.Loading}><Loading /></div>
    return (
        <div className={styles.main}>
            <UpdateWallet setOpen={setOpen} open={open} userID={profile._id} />
            <div onClick={handleOpen} className={styles.wallet}>
                <span>ت {addCommaToPrice(profile.wallet)}</span>
                <img className='h-10' src={wallet} />
            </div>
            <div className={styles.profile}>
                <div className={styles.imageContainer}>
                    <img className={styles.profileImage} alt='profile' src={userProfile} />
                    {/* <div className={styles.addImage}/> */}
                </div>
                <div className={styles.fullname}>{profile.full_name}</div>
            </div>
            <ul className={styles.fieldsContainer}>
                <Link className={styles.links} to='/dashboard'>
                    <li className={styles.container}>
                        <img className={styles.icon} src={home} alt='home'/>
                        <div className={styles.field}>خانه</div>
                    </li>
                </Link>
                <Link className={styles.links} to='/dashboard/users'>
                    <li className={styles.container}>
                        <img className={styles.icon} src={users} alt='users'/>
                        <div className={styles.field}>کاربران</div>
                    </li>
                </Link>
                <Link className={styles.links} to='/dashboard/plans'>
                    <li className={styles.container}>
                        <img className={styles.icon} src={plans} alt='plans'/>
                        <div className={styles.field}>پلن ها</div>
                    </li>
                </Link>
                <Link className={styles.links} to='/dashboard/configs'>
                    <li className={styles.container}>
                        <img className={styles.icon} src={configs} alt='configs'/>
                        <div className={styles.field}>کانفیگ ها</div>
                    </li>
                </Link>
                <Link className={styles.links} to='/dashboard/bills'>
                    <li className={styles.container}>
                        <img className={styles.icon} src={payments} alt='payments'/>
                        <div className={styles.field}>تراکنش ها</div>
                    </li>
                </Link>
                <Link className={styles.links} to='/dashboard/support'>
                    <li className={styles.container}>
                        <img className={styles.icon} src={payments} alt='payments'/>
                        <div className={styles.field}>پشتیبانی ها</div>
                    </li>
                </Link>
            </ul>
        </div>
    )
    
};

export default Sidebar;