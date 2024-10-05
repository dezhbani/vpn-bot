// import React, { useEffect, useState } from 'react';
// import Config from './Config';
// import ConfigSidebar from './ConfigSidebar';

// const Configs = ({configs}) => {
//     const [selectedItem, setSelectedItem] = useState(null);
//     console.log(selectedItem);
    
//     return (
//         <div className='flex mt-32'>
//             <ConfigSidebar selectedItem={selectedItem} setSelectedItem={setSelectedItem} configs={configs}/>
//         </div>
//     );
// };

// export default Configs;


import React, { useContext, useEffect, useState } from 'react';
import Config from './Config';
import Status from './Status';
import { getConfigDetails } from '../../services/config.service';
import { addCommaToPrice, clculateData, timestampToTime } from '../../../public/function';
import { toast } from 'react-toastify';
import Modal from '../../../public/components/Modal';
import { ProfileContext } from '../../../context/UserProfileContext';
import UploadIcon from '../../assets/Upload.svg';
import DownloadIcon from '../../assets/Download.svg';
import ConfigSidebar from './ConfigSidebar';
import Repurchase from './Repurchase';


const ConfigSection = ({ configs }) => {
    const [status, setStatus] = useState('')
    const [data, setData] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    const getConfigByID = async () => {
        setLoading(true); 
        try {
            const result = await getConfigDetails(selectedItem);
            if(result.config.status) setStatus(result.config.status)
            const originalDateTime = timestampToTime(result.config?.expiry);
            const modifiedDateTime = originalDateTime?.split(' ');
            result.config.expiry = modifiedDateTime
            setData(result.config);
            setPlan(result.plan);
            setLoading(false);  // End loading after the data is fetched (or failed)
        } catch (error) {
            toast.error(error, 3000);
            setData(null);  // Set to null in case of an error
        }
    };

    useEffect(() => {
        if (selectedItem) {
            getConfigByID();
        }
    }, [selectedItem]);

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    useEffect(() => {
        if (configs && configs.length > 0 && !selectedItem) setSelectedItem(configs[0].configID);
    }, [configs, selectedItem, setSelectedItem]);

    return (
        <>
            <Modal isOpen={loading} loading={loading} />
            {
                !loading && (
                    <div className='flex h-[92%] dir-ltr bg-white w-4/5 shadow-[2px_4px_30px_0px_#00000010] mx-5  mt-32 rounded-xl'>
                        <div className={'flex mx-4 h-96 my-8 z-50 dir-ltr float-left w-full'}>
                            <ConfigSidebar configs={configs} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
                            <div className='w-full flex justify-around'>
                                <Config data={data}/>
                                <Repurchase data={data} plan={plan} status={status} />
                                <Status status={status} />
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default ConfigSection;
