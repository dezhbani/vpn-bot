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

const ConfigSidebar = ({ configs, selectedItem: configID, setSelectedItem }) => {

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    return (
        <ul className='py-2 pr-2 flex flex-col w-[30%]'>
            {
                configs.map(config => (
                    <li 
                        key={config.configID} 
                        className={`p-2 my-2 flex items-center relative hover:text-main-blue ${configID === config.configID && 'text-main-blue ml-3 w-fit flex bg-white shadow-md rounded-lg border-2 border-main-blue transition-all duration-300'}`} 
                        onClick={() => handleItemClick(config.configID)}>
                        <p className='font-[iran-sans] text-xl'>{config.name}</p>
                    </li>
                ))
            }
        </ul>
    );
};

export default ConfigSidebar;
