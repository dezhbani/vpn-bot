import React, { useEffect, useState } from 'react';
import { getConfigDetails } from '../../services/config.service';
import DataChart from './DataChart';
import Modal from '../../../public/components/Modal';
import Loading from '../../../public/components/Loading';
import { toast } from 'react-toastify';
import { clculateData, timestampToTime } from '../../../public/function';
import DownloadIcon from '../../assets/Download.svg';
import UploadIcon from '../../assets/Upload.svg';
import ClockIcon from '../../assets/Clock.svg';

const Config = ({ data }) => {

    return (
        <div className='flex w-full justify-start'>
            <div className='h-full font-[iran-sans] flex flex-col'>
                <div className='flex justify-center'>
                    <DataChart data={data || {}} />
                </div>
                <div className='text-2xl flex items-end h-full'>
                    <div className='flex my-5 items-center text-xl'>
                        <p className='mx-3 flex flex-col items-center'>
                            <span className='font-medium'>{data?.expiry[0]}</span>
                            <span className='flex justify-center text-sm '>{data?.expiry[1]}</span>
                        </p>
                        <span className='flex items-center flex-row-reverse'><img className='h-10 mx-2' src={ClockIcon} />:تاریخ انقضا</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Config;
