import React, { useMemo } from 'react';
import activeIcon from '../assets/Active.svg';
import inactiveIcon from '../assets/Inactive.svg';

const Status = ({status}) => {
    const checkStatus = useMemo(() => {
        const statusList = ['inactive', 'active', 'expired', 'unknown', 'end-data'];
        const statusText = ['غیرفعال', 'فعال', 'منقضی شده', 'نامشخص', 'اتمام حجم'];
        const colors = ['bg-yellow-500/10 text-yellow-500', 'bg-main-blue/10 text-main-blue', 'bg-red-500/10 text-red-500', 'bg-gray-400/25 text-gray-400', 'bg-violet-500/10 text-violet-500'];
        const images = [inactiveIcon, activeIcon, inactiveIcon, activeIcon, inactiveIcon];

        const index = statusList.indexOf(status);
        
        return {
            color: colors[index],
            text: statusText[index],
            image: images[index]
        };
    }, [status])
    
    return (
        <div className={`${checkStatus.color} flex items-center w-fit h-fit py-1 px-3 rounded-3xl`}>
            {
                <img className='h-5 fill-gray-100' src={checkStatus.image} />
            }
            <span className='px-2'>{checkStatus.text}</span>
        </div>
    );
};

export default Status;