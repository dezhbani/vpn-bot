import React, { useState } from 'react';
import { timestampToTime } from '../../public/function';

const Config = ({config, changeStatus}) => {
    const [status, setStatus] = useState(config.status)
    const handleClick = async () => {
        const status = await changeStatus(config.userID, config.configID)
        setStatus(status)
    }
    return (
        <tr className=''>
            <td class="px-6 text-center py-4 whitespace-nowrap text-base font-medium text-gray-800 dark:text-neutral-200">{config.name}</td>
            <td class="px-6 text-center py-4 whitespace-nowrap text-base text-gray-800 dark:text-neutral-200">{timestampToTime(config.expiry_date, false)}</td>
            <td class="px-6 text-center py-4 whitespace-nowrap text-sm font-medium">
                <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" value={config._id} class="sr-only peer" checked={status} />
                    <div onClick={handleClick} class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:end-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </td>
            <td class="px-6 text-center py-4 whitespace-nowrap text-base text-gray-800 dark:text-neutral-200">
                <button onClick={() => {navigator.clipboard.writeText(config.config_content);}}>کپی</button>
            </td>
        </tr>
    );
};

export default Config;