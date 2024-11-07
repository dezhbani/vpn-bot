import React, { useState } from 'react';
import { clculateData } from '../../../public/function';
import UploadIcon from '../../assets/Upload.svg';
import DownloadIcon from '../../assets/Download.svg';
import Invoice from '../../public/Invoice';


const RepurchaseButton = ({plan}) => {
    const [openInvoice, setOpenInvoice] = useState(false);
    const handleClose = () => setOpenInvoice(false)
    const handleOpen = () => setOpenInvoice(true)

    return (    
        <>
            <div className='w-full h-fit flex justify-end my-9' onClick={handleOpen}>
                <button className='bg-main-blue w-full p-1 rounded text-white font-iran-sans text-lg'>صدور فاکتور تمدید</button>
            </div>
            <Invoice plan={plan} open={openInvoice} handleClose={handleClose} repurchase={true} />
        </>
    )
}

const Repurchase = ({plan, status, data}) => {
    return (
        <div className='h-full flex w-full flex-col mx-5'>
            <div className="w-96 flex flex-col m-3 font-iran-sans text-lg px-8 py-5 justify-between">
                <div>
                    <div className="flex flex-row-reverse justify-between mb-10"><span className='flex flex-row-reverse'><img className='h-6 mx-2' src={UploadIcon} />:آپلود</span><span>{clculateData(data?.up)}</span></div>
                    <div className="flex flex-row-reverse justify-between my-10"><span className='flex flex-row-reverse'><img className='h-6 mx-2' src={DownloadIcon} />:دانلود</span><span>{clculateData(data?.down)}</span></div>
                    <div className="flex flex-row-reverse justify-between my-10"><span>:حجم کل</span><span>{clculateData(data?.total)}</span></div>
                    <div className="flex flex-row-reverse justify-between mt-10"><span>:حجم باقی مانده</span><span>{clculateData(data?.total - (data?.up + data?.down))}</span></div>
                </div>
                <div>
                    {
                        status == 'expired' || status == 'end-data' ? <RepurchaseButton plan={plan} /> : ''
                    }
                </div>
            </div>
        </div>
    );
};

export default Repurchase;