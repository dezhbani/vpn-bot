import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getConfigByID } from '../services/config.service';
import Sidebar from '../public/Sidebar';
import Bill from './modules/Bill';
import Plan from './modules/Plan';
import Config from './modules/Config';
import Options from './modules/Options';
import Modal from '../../public/components/Modal';
import NotFoundError from '../../admin/public/errors/NotFoundError';

const ConfigDetails = () => {
    const { configID } = useParams()
    const [data, setData] = useState()
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(false);

    const getConfig = async () => {
        setLoading(true)
        const result = await getConfigByID(configID)

        setData(result)
        setLoading(false)
    }

    useEffect(() => {
        getConfig()
    }, [reload])

    if(!loading && !data) return <NotFoundError />

    return (
        <>
            <Sidebar />
            <Modal isOpen={loading} loading={loading} />
            {
                !loading && data &&
                <div className='flex z-20 dir-ltr w-[calc(100%-7rem)] sm:w-[calc(75%-3.5rem)] lg:w-[calc(80%-2rem)] xl:w-4/5 ml-4 mr-4 sm:mr-6 mt-24 mb-4 lg:mt-32 rounded-xl flex-wrap font-iran-sans'>
                    <div className='flex flex-row-reverse justify-between w-full h-fit bg-white shadow-[2px_4px_30px_0px_#00000010] mb-4 rounded-xl p-2'>
                        <Options plan={data?.plan} configID={configID} config={data?.config} setReload={setReload} reload={reload} />
                    </div>
                    <div className='flex w-full h-max max-sm:flex-wrap-reverse max-md:sm:flex-col-reverse'>
                        <div className='w-full md:w-2/5 lg:w-3/5 mr-3'>
                            <div className='w-full overflow-x-auto dir-rtl h-fit bg-white shadow-[2px_4px_30px_0px_#00000010] mb-4 max-md:mt-4 rounded-xl p-3'>
                                <Plan plan={data?.plan} />
                            </div>
                            <div className='w-full overflow-x-auto dir-rtl h-auto bg-white shadow-[2px_4px_30px_0px_#00000010] mt-4 rounded-xl p-3'>
                                {
                                    data?.bills?.map(bill => <Bill bill={bill} key={bill._id} />)
                                }
                            </div>
                        </div>
                        <div className='w-full md:w-3/5 lg:w-2/5 h-full bg-white shadow-[2px_4px_30px_0px_#00000010] rounded-xl max-md:mb-2 md:ml-3 p-3'>
                            <Config config={data?.config} />
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default ConfigDetails;