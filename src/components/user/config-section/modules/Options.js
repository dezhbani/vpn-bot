import React, { useState } from 'react';
import SettingIcon from '../../assets/SettingBlue.svg';
import Invoice from '../../public/Invoice';


const Options = ({plan}) => {
    // const [openSetting, setOpenSetting] = useState(false)
    
    const [openInvoice, setOpenInvoice] = useState(false);
    const handleClose = () => setOpenInvoice(false)
    const handleOpen = () => setOpenInvoice(true)

    return (
        <>
            <Invoice plan={plan} open={openInvoice} handleClose={handleClose} repurchase={true} />
            <div className='flex'>
                {/* <img className='bg-main-blue/10 p-2 rounded-xl h-9 w-9 mx-2' src={EditIcon} alt='EditIcon' /> */}
                <img className='bg-main-blue/10 p-2 rounded-xl h-9 w-9 mx-2' src={SettingIcon} alt='SettingIcon' />
            </div>
            <div className='flex items-center'>
                <p className="flex w-fit items-center justify-center text-base text-main-blue bg-main-blue/10 px-4 py-2 mx-3 rounded-md">ارتقا کانفیگ</p>
                <p className="flex w-fit items-center justify-center text-base text-white bg-main-blue px-4 py-2 mx-3 rounded-md" onClick={handleOpen}>تمدید کانفیگ</p>
            </div>
        </>
    );
};

export default Options;