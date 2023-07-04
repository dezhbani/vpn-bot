import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserDetails, repurchase } from '../services/users.service';
import styles from './UserDetails.module.css'
import more from '../assets/Menu.svg'
import Bills from './Bills';
import Configs from './Configs';
import AddConfig from './AddConfig';
import { Button } from '@mui/material';
import profile from '../assets/profile.png'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { getPlans } from '../services/plan.service';
import { resendConfig } from '../services/config.service';
const UserDetails = () => {
    const { userID } = useParams()
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState({});
    const [plans, setPlans] = useState([]);
    const [action, setAction] = useState(false);
    const [buyConfig, setBuyConfig] = useState(false);
    useEffect(()=>{
        const getDetails = async() => {
            setUser(await getUserDetails(userID))
        }
        const getAllPlans = async () => {
            setPlans(await getPlans())
        }
        getAllPlans()
        getDetails()
    }, [])
    const handleOpen = () => setOpen(true);
    const repurchaseConfig = async () =>{
        try {
            const addPlanResult = await repurchase(user._id);
            toast.success(addPlanResult.message)
            setTimeout(() => window.location.reload(true), 5000);
        } catch (error) {
            console.log(error.response);
            toast.error(error.response.data.message, {autoClose: 2000})
        }
    }
    const buyNewConfig = () =>{
        setBuyConfig(!buyConfig)
        handleOpen()
    }
    const resendUserConfig = async () =>{
        try {
            const config = user.configs.pop()
            const data = {
                userID,
                configID: config._id
            }
            const result = await resendConfig(data);
            toast.success(result.message)
            setTimeout(() => window.location.reload(true), 5000);
        } catch (error) {
            console.log(error.response);
            toast.error(error.response.data.message, {autoClose: 2000})
        }
    }
    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.profileContainer}>
                    <div className={styles.profile}>
                        <div className={styles.profileDetails}>
                            <img src={profile} className={styles.profileImage} />
                            <div className={styles.profile}>
                                <div className={styles.name}>{`${user.first_name} ${user.last_name}`}</div>
                                <div className={styles.mobile}>{user.mobile}</div>
                            </div>
                        </div>
                        <AddConfig open={open} setOpen={setOpen} plans={plans} />
                    </div>
                    <div className={styles.buttonContainer}>
                        <Button onClick={repurchaseConfig}>تمدید کانغیگ</Button>
                        <Button onClick={resendUserConfig}>ارسال مجدد کانفیگ</Button>
                        <Button>اضافه کردن کانغیگ و فاکتور</Button>
                        <Button onClick={buyNewConfig} className={styles.addConfig}>خرید کانفیگ</Button>
                    </div>
                </div>
            </div>
            <div className={styles.containerRight}>
                <div className={user.bills?.length > 0? styles.billsContainer: styles.hidden}>
                    <div className={styles.lable}>فاکتور های خرید:</div>
                    <div className={styles.bills}>
                        <Bills bills={user.bills}/>
                    </div>
                </div>
                <div className={user.configs?.length > 0? styles.allConfig: styles.hidden}>
                    <div className={styles.lable}>همه کانفیگ ها:</div>
                    <div className={styles.configs}>
                        <Configs configs={user.configs}/>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default UserDetails;