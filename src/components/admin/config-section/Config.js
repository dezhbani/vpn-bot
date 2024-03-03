import React, { useState } from 'react';
import { timestampToTime } from '../../public/function';

const Config = ({config, changeStatus}) => {
    const [status, setStatus] = useState(config.status)
    const handleClick = async () => {
        const status = await changeStatus(config.userID, config.configID)
        setStatus(status)
    }
    return (
        <div className="w-full h-[80px] border-2 p-1 m-1 rounded-full bg-white">
            <div className="flex items-center h-full text-xl p-10" style={{direction: "ltr"}}>
                <div className="w-[25%]">{config.name}</div>
                <div className="w-[20%] flex justify-center">{timestampToTime(config.expiry_date, false)}</div>
                <div className="w-[20%] flex justify-center">{config.port}</div>
                <div className="w-[20%] flex justify-center"> 
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value={config._id} class="sr-only peer" checked={status} />
                        <div onClick={handleClick} class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div className="w-[15%] flex justify-center">
                    <button onClick={() => {navigator.clipboard.writeText(config.config_content);}}>کپی</button>
                </div>
            </div>
        </div>
    );
};

export default Config;