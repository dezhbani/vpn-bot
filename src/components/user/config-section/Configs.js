import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import Navbar from '../public/Navbar';
import Config from './Config';
import { getAllConfigs } from '../services/config.service';
import Modal from '../../public/components/Modal';

const Configs = () => {
    const [configs, setConfigs] = useState([])
    const [loading, setLoading] = useState(true);

    const getConfigList = async () => {
        const result = await getAllConfigs()
        setConfigs(result.configs)
        setLoading(false)
    }

    useEffect(() => {
        getConfigList()
    }, [])

    return (
        <>
            <Sidebar />
            {/* <Navbar /> */}
            <Modal isOpen={loading} loading={loading} />
            {
                configs.length &&   <div className='flex z-20 dir-ltr bg-white w-4/5 mx-5 mt-36 rounded-xl flex-wrap'>
                    <div className="flex items-center dir-ltr font-iran-sans mb-8 bg-[#fff] shadow-[2px_4px_30px_0px_#00000010] rounded-2xl border-opacity-70 duration-100 w-full min-h-20 my-2 px-5 [&>*]:p-4">
                        <div className='w-1/4'>نام کاربری</div>
                        <div className='w-1/4 flex justify-center m-auto items-center'>وضعیت</div>
                        <div className='w-2/6 flex items-center justify-center px-4'>ترافیک مصرفی</div>
                        <div className='w-1/6'></div>
                    </div>
                    {
                        configs?.map(config => <Config key={config._id} config={config} />)
                    }
                </div>
            }
        </>
    );
};

export default Configs;