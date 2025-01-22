import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import Navbar from '../public/Navbar';
import Config from './Config';
import { getAllConfigs } from '../services/config.service';
import Modal from '../../public/components/Modal';
import { Link } from 'react-router-dom';

const Configs = () => {
    const [configs, setConfigs] = useState([])
    const [loading, setLoading] = useState(true);

    const getConfigList = async () => {
        const result = await getAllConfigs()
        setConfigs(result?.configs || result)
        setLoading(false)
    }
    
    useEffect(() => {
        getConfigList()
    }, [])

    return (
        <div className='h-screen'>
            <Sidebar />
            {/* <Navbar /> */}
            <Modal isOpen={loading} loading={loading} />
            {
                !loading &&
                <div className={`flex ${!configs.length && "h-[78%]"} z-20 dir-ltr w-[calc(100%-7rem)] sm:w-[calc(75%-3.5rem)] lg:w-[calc(80%-2rem)] xl:w-4/5 ml-4 mr-6 mt-28 mb-4 lg:mt-32 rounded-xl flex-wrap font-iran-sans`}>
                    {
                        configs.length ?
                            configs?.map(config => <Config key={config._id} config={config} />)
                            : <div className='dir-rtl w-full flex flex-col mb-40 min-h-[100%] justify-center items-center text-gray-400 bg-white shadow-[2px_4px_30px_0px_#00000010] rounded-2xl'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6 md:w-8 md:h-8 transition-colors" fill="currentColor"><path d="M2.978 8.358l-2.978-2.618 8.707-4.74 3.341 2.345 3.21-2.345 8.742 4.639-3.014 2.68.014.008 3 4.115-3 1.634v4.122l-9 4.802-9-4.802v-4.115l1 .544v2.971l7.501 4.002v-7.889l-2.501 3.634-9-4.893 2.978-4.094zm9.523 5.366v7.875l7.499-4.001v-2.977l-5 2.724-2.499-3.621zm-11.022-1.606l7.208 3.918 1.847-2.684-7.231-3.742-1.824 2.508zm11.989 1.247l1.844 2.671 7.208-3.927-1.822-2.498-7.23 3.754zm-9.477-4.525l8.01-4.43 7.999 4.437-7.971 4.153-8.038-4.16zm-2.256-2.906l2.106 1.851 7.16-3.953-2.361-1.657-6.905 3.759zm11.273-2.052l7.076 3.901 2.176-1.935-6.918-3.671-2.334 1.705z"></path> </svg>
                                <span className='m-2'>هنوز کانفیگی خریداری نکردی!</span>
                                <button className='m-2 py-1 px-4 rounded-lg bg-main-blue text-white'><Link to='/plans'>مشاهده پلن ها</Link></button>
                            </div>
                    }
                </div>
            }
        </div>
    );
};

export default Configs;