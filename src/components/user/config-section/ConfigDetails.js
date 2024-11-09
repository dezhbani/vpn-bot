import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getConfigByID } from '../services/config.service';
import Navbar from '../public/Navbar';
import Sidebar from '../public/Sidebar';
import Bill from './modules/Bill';
import Plan from './modules/Plan';
import Config from './modules/Config';
import Options from './modules/Options';
import Modal from '../../public/components/Modal';

const ConfigDetails = () => {
    const { configID } = useParams()
    const [data, setData] = useState()
    const [loading, setLoading] = useState(true);

    const getConfig = async () => {
        const result = await getConfigByID(configID)
        setData(result)
        setLoading(false)
    }

    useEffect(() => {
        getConfig()

    }, [])
    return (
        <>
            <Sidebar />
            <Navbar />
            <Modal isOpen={loading} loading={loading} />
            {
                !loading &&
                <div className='flex flex-col z-20 dir-ltr w-4/5 mx-5 mt-32 rounded-xl font-iran-sans'>
                    <div className='flex flex-row-reverse justify-between w-full h-fit bg-white shadow-[2px_4px_30px_0px_#00000010] mb-4 rounded-xl p-2'>
                        <Options plan={data?.plan} configID={configID} />
                    </div>
                    <div className='flex'>
                        <div className='w-3/5 mr-3'>
                            <div className='w-full h-fit bg-white shadow-[2px_4px_30px_0px_#00000010] mb-4 rounded-xl p-3'>
                                <Plan plan={data?.plan} />
                            </div>
                            <div className='w-full h-auto bg-white shadow-[2px_4px_30px_0px_#00000010] mt-4 rounded-xl p-3'>
                                {
                                    data?.bills?.map(bill => <Bill bill={bill} key={bill._id} />)
                                }
                            </div>
                        </div>
                        <div className='w-2/5 h-fit bg-white shadow-[2px_4px_30px_0px_#00000010] rounded-xl ml-3 p-3'>
                            <Config config={data?.config} />
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default ConfigDetails;