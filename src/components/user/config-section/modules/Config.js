import React from 'react';
import DataChart from '../../home-section/configs/DataChart';
import { clculateData, timestampToTime } from '../../../public/function';

const Config = ({ config }) => {
    return (
        <>
            <div className='w-full flex justify-center '>
                <div className='w-52'>
                    <DataChart data={config} />
                </div>
            </div>
            <div className='h-full flex w-full flex-col'>
                <div className="flex flex-col my-3 mx-1 text-md px-5 py-3">
                    <div>
                        <div className="flex flex-row-reverse justify-between mb-7"><span className='flex flex-row-reverse'>:آپلود</span><span>{clculateData(config?.up)}</span></div>
                        <div className="flex flex-row-reverse justify-between my-7"><span className='flex flex-row-reverse'>:دانلود</span><span>{clculateData(config?.down)}</span></div>
                        <div className="flex flex-row-reverse justify-between my-7"><span>:حجم کل</span><span>{clculateData(config?.total)}</span></div>
                        <div className="flex flex-row-reverse justify-between my-7"><span>:حجم باقی مانده</span><span>{clculateData(config?.total - (config?.up + config?.down))}</span></div>
                        <div className="flex flex-row-reverse justify-between mt-7"><span>:تاریخ انقضا</span><span>{timestampToTime(config?.expiryTime)}</span></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Config;