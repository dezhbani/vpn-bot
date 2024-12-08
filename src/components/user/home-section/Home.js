import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import Configs from './configs/ConfigSection';
import { getConfigs } from '../services/config.service';
import Modal from '../../public/components/Modal';
import Navbar from '../public/Navbar';

const Home = () => {
    const [configs, setConfigs] = useState(null); // Initialize with null
    const [loading, setLoading] = useState(true);

    const getConfigDetails = async () => {
        const configsResponse = await getConfigs();
        if (configsResponse?.configs === null) setConfigs(null); // Set configs state to null if response is null
        else setConfigs(configsResponse.configs || []); // Set the array if it's not null, otherwise set empty array
    };

    useEffect(() => {
        getConfigDetails();
    }, []);

    useEffect(() => {
        if (configs !== null) setLoading(false); // Set loading to false once configs are retrieved or set to null
    }, [configs]);

    return (
        <div className='scroll-auto'>
            {/* <Modal isOpen={loading} loading={loading} /> */}
            {/* <Navbar /> */}
            <Sidebar />
            <div className='h-full w-full z-10'>
                {/* {
                    Array.isArray(configs) && configs.length > 0 && <Configs configs={configs} />
                } */}
            </div>
        </div>
    );
};

export default Home;
