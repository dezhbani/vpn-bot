import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import { changeConfigsStatus, getConfigsByDay, getConfigsList } from '../services/config.service';
import Config from './Config';
import Modal from '../../public/components/Modal';
import Skeleton from 'react-loading-skeleton';
import { copyElement } from '../../public/function';
import NoConfigs from './NoConfigs';
const Table = ({configs, changeStatus, setLoading}) => {
    return (
        <div class="w-full mb-10">
            <div class="overflow-x-auto">
                <div class="p-1.5 w-full inline-block align-middle">
                    <div class="border rounded-lg overflow-x-auto shadow overflow-hidden dark:border-neutral-700 dark:shadow-gray-900">
                        <table class="min-w-full h-max divide-y divide-gray-200 dark:divide-neutral-700">
                            <thead class="bg-gray-50 dark:bg-neutral-700">
                                <tr>
                                    <th scope="col" class="px-6 dir-rtl py-3 text-center text-sm font-medium text-gray-500 uppercase dark:text-neutral-400">نام کانفیگ</th>
                                    <th scope="col" class="px-6 dir-rtl py-3 text-center text-sm font-medium text-gray-500 uppercase dark:text-neutral-400">زمان اتمام</th>
                                    <th scope="col" class="px-6 dir-rtl py-3 text-center text-sm font-medium text-gray-500 uppercase dark:text-neutral-400">فعال/غیرفعال</th>
                                    <th scope="col" class="px-6 dir-rtl py-3 text-center text-sm font-medium text-gray-500 uppercase dark:text-neutral-400"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y h-full divide-gray-200 dark:divide-neutral-700 w-full">
                                {   
                                    configs?.length?
                                    configs.map(config => <Config key={config._id} config={config} changeStatus={changeStatus} setLoading={setLoading}/>)
                                    :(
                                        configs == null && <NoConfigs />
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
const Configs = () => {
    // const [loading, setLoading] = useState(false)
    const [configs, setConfigs] = useState([]);
    const [data, setData] = useState({all: true})
    const [search, setSearch] = useState({})
    const allConfigs = async () => {
        if (configs.length == 0) setConfigs(true)
        const configsList = await getConfigsList()
        setConfigs(configsList?.configs)
    }
    const configsByDate = async () => {
        // setLoading(true)
        const configsList = await getConfigsByDay(search)
        // setLoading(false)
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
        // setLoading(true)
        const response = await changeConfigsStatus({userID, configID})
        allConfigs()
        // if(response) setLoading(false)
        return response.configStatus
    }
                
    useEffect(() => {
        data.all && allConfigs()
        document.title = 'dashboard';
    }, []);

    return (
        <div className='h-full w-full'>
                <Sidebar />
            <div className="bg-white w-[calc(100%-72px)] sm:w-3/4 lg:w-5/6 xl:w-[85%]" >
                <div className="px-10 flex flex-wrap w-full dir-rtl lg:px-20">
                    <div className="flex dir-rtl bg-white justify-center px-3 py-1 border-2 m-7 rounded-full h-[50px]">
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
                    {/* <div className="flex flex-wrap w-full dir-rtl"> */}
                        {
                            <Table configs={configs} changeStatus={changeStatus} />
                        }
                    {/* </div> */}
                </div>
            </div>
        </div>
    );
};

export default Configs;