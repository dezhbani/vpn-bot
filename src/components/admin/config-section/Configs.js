import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import styles from './Configs.module.css';
import { changeConfigsStatus, getConfigsByDay, getConfigsList } from '../../services/config.service';
import Config from './Config';
import Modal from '../../public/components/Modal';
import Skeleton from 'react-loading-skeleton';
import { copyElement } from '../../public/function';
import NoConfigs from './NoConfigs';

const Configs = () => {
    const [loading, setLoading] = useState(false)
    const [configs, setConfigs] = useState([]);
    const [data, setData] = useState({all: true})
    const [search, setSearch] = useState({})
    const allConfigs = async () => {
        const configsList = await getConfigsList()
        setConfigs(configsList.configs)
    }
    const configsByDate = async () => {
        setLoading(true)
        const configsList = await getConfigsByDay(search)
        setLoading(false)
        setConfigs(configsList.configs)
    }
    const click = (event) =>{
        const name = event.target.getAttribute('name')
        setData({[name]: true});
        if(name == 'all') {
            allConfigs()
            setSearch({})
        }
    }
    const change = (event) =>{
        setSearch({[event.target.name]: event.target.value});
    }
    const changeStatus = async (userID, configID) => {
        setLoading(true)
        const response = await changeConfigsStatus({userID, configID})
        allConfigs()
        if(response) setLoading(false)
        return response.configStatus
    }
                
    useEffect(() => {
        data.all && allConfigs()
        document.title = 'dashboard';
    }, []);

    return (
        <>
            <Sidebar />
            <div className={styles.mainContainer} >
                <div className={styles.container}>
                    <div className="flex bg-white justify-center px-3 py-1 border-2 m-7 rounded-full h-[50px]">
                        <p className="flex justify-center items-center">فیلتر بر اساس:</p>
                        <div className="flex items-center my-3">
                            <span onClick={click} name='all' className={`px-3 py-2 mx-2 ${data.all? "rounded-md bg-blue-400 text-white": "hover:border-b-2 border-blue-400 transition duration-500 ease-out"}`}>همه</span>
                            {/* <span onClick={click} name='percent' className={`px-3 py-2 mx-2 ${data.percent? "rounded-md bg-blue-400 text-white": "hover:border-b-2 border-blue-400 transition duration-500 ease-out"}`}>حجم باقی مانده</span> */}
                            <span onClick={click} name='expiry' className={`px-3 py-2 mx-2 ${data.expiry? "rounded-md bg-blue-400 text-white": "hover:border-b-2 border-blue-400 transition duration-500 ease-out"}`}>زمان اتمام</span>
                        </div>
                        <div className="flex items-center my-3">
                            {
                                data.percent && <input value={search.percent} onChange={change} name='percent' type="text" className="px-2 text-sm outline-none py-2 mx-2 rounded-md border-2 border-gray-400 focus:border-blue-400" placeholder="حجم باقی مانده (درصد)" />
                            }
                            {
                                data.expiry && <input value={search.day} onKeyUp={search.day? configsByDate: null} onChange={change} name='day' type="text" className="px-2 text-sm outline-none py-2 mx-2 rounded-md border-2 border-gray-400 focus:border-blue-400" placeholder="زمان باقی مانده (روز)" />
                            }
                        </div>
                    </div>
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
                        {   
                            configs?.length?
                            configs.map(config => <Config key={config._id} config={config} changeStatus={changeStatus} setLoading={setLoading}/>)
                            :(
                                configs == null? <NoConfigs /> : copyElement(<Skeleton className='w-[960px] h-[80px] border-2 m-2 rounded-full'/>, 4)
                            )
                        }
                    </div>
                </div>
            </div>
            <Modal isOpen={loading} loading={loading} />
        </>
    );
};

export default Configs;