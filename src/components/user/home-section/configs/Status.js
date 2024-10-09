import React, { useMemo } from 'react';
import Typewriter from 'typewriter-effect';

const Status = ({ status='unknown' }) => {
    const checkStatus = useMemo(() => {
        const statusList = ['inactive', 'active', 'expired', 'unknown', 'end-data'];
        const statusText = ['غیرفعال', 'فعال', 'منقضی شده', 'نامشخص', 'اتمام حجم'];
        const colors = ['bg-yellow-500', 'bg-main-blue', 'bg-red-500', 'bg-gray-400', 'bg-violet-500'];

        const index = statusList.indexOf(status);
        return {
            color: colors[index],
            text: statusText[index]
        };
    }, [status]);

    return (
        <div className='h-fit w-fit flex justify-end flex-col mx-5'>
            <div className="flex items-center justify-end m-4 h-fit min-w-full"> {/* Set minimum width */}
                <div className="min-w-[120px] text-right"> {/* Adjust min-width to reserve enough space for the typewriter effect */}
                    <div className='font-[b-kamran] text-3xl font-normal'>
                        <Typewriter
                            options={{
                                strings: [checkStatus.text], // Use an array to pass the string
                                autoStart: true,
                                loop: true,
                                pauseFor: 10000,
                                cursor: '',
                                delay: 150,
                                deleteSpeed: 150,
                            }}
                        />
                    </div>
                </div>
                <div className="relative flex items-center justify-center m-5">
                    <div className={`absolute w-8 h-8 ${checkStatus.color} rounded-full opacity-30 blur-md animate-pulse`}></div>
                    <div className={`relative w-5 h-5 ${checkStatus.color} rounded-full`}></div>
                </div>
            </div>
        </div>
    );
};

export default Status;
