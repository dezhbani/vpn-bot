import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import styles from './Configs.module.css';
import { changeConfigsStatus, getConfigsList } from '../../services/config.service';
import Config from './Config';
import Modal from '../../public/components/Modal';
import Skeleton from 'react-loading-skeleton';
import { copyElement } from '../../public/function';

const Configs = () => {
    const [loading, setLoading] = useState(false)
    const [configs, setConfigs] = useState([]);
    const allConfigs = async () => {
        // setLoading(true)
        const configsList = await getConfigsList()
        // if (configsList) setLoading(false)
        setConfigs(configsList?.configs)
    }
    const changeStatus = async (userID, configID) => {
        setLoading(true)
        const response = await changeConfigsStatus({userID, configID})
        allConfigs()
        if(response) setLoading(false)
        return response.configStatus
    }
    
    useEffect(() => {
        allConfigs()
        document.title = 'dashboard';
    }, []);

    return (
        <>
            <Sidebar />
            <div className={styles.mainContainer} >
                <div className={styles.container}>
                    {/* <div className={`w-full top-0 relative h-[120px] border-2 p-1 mb-5 bg-white rounded-br-3xl rounded-bl-3xl  ${styles.filterHeader}`}>
                        jjjjjjjjjjjjjjjj
                    </div> */}
                    <div className={styles.container}>
                    <div className="w-full h-[80px] border-2 m-1 rounded-full bg-white">
                        <div className="flex items-center h-full text-xl p-10" style={{direction: "ltr"}}>
                            <div className="w-[25%] flex justify-center">نام کانفیگ</div>
                            <div className="w-[20%] flex justify-center">زمان اتمام</div>
                            <div className="w-[20%] flex justify-center">پورت</div>
                            <div className="w-[20%] flex justify-center">وضعیت</div>
                            <div className="w-[15%] flex justify-center">جزیُیات</div>
                        </div>
                    </div>
                        {   !configs.length?
                            copyElement(<Skeleton className='w-[960px] h-[80px] border-2 m-2 rounded-full'/>, 4)
                            :configs?.map(config => <Config key={config._id} config={config} changeStatus={changeStatus} setLoading={setLoading}/>)
                        }
                    </div>
                </div>
            </div>
            <Modal isOpen={loading} loading={loading} />
        </>
    );
};

export default Configs;