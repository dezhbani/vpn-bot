import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import Configs from './configs/ConfigSection';
import { getConfigs } from '../services/config.service';
import Modal from '../../public/components/Modal';

const Home = () => {
    const [configs, setConfigs] = useState([])
    const [loading, setLoading] = useState(true);

    const getConfigDetails = async () =>{
        const configs = await getConfigs()
        setConfigs(configs.configs)
    }
    const checkLoading = () => configs.length > 0 && setLoading(false)
    useEffect(() => {
        getConfigDetails()
    }, [])
    useEffect(() => {
        checkLoading()
    }, [configs])
    return (
        <div className='scroll-auto'>
            <Sidebar />
            <Modal isOpen={loading} loading={loading}/>
            <section className='h-full z-10'>
                {
                    configs.length > 0? <Configs configs={configs} /> : ''
                }
            </section>
        </div>
    );
};

export default Home;