import React, { useContext, useState } from 'react';
import { addCommaToPrice, clculateData } from '../../../public/function';
import UploadIcon from '../../assets/Upload.svg';
import DownloadIcon from '../../assets/Download.svg';
import { ProfileContext } from '../../../context/UserProfileContext';
import Modal from '../../../public/components/Modal';


const RepurchaseButton = ({plan}) => {
    const [factor, setFactor] = useState(false);
    const handleClose = () => setFactor(false)
    const user = useContext(ProfileContext)

    return (    
        <>
            <div className='w-full h-fit flex justify-end my-9' onClick={() => setFactor(true)}>
                <button className='bg-main-blue w-full p-1 rounded text-white font-iran-sans text-lg'>صدور فاکتور تمدید</button>
            </div>
            <Modal isOpen={factor} onClose={handleClose}>
                <div className="w-96 flex flex-col m-3 font-iran-sans text-lg px-8 py-5 justify-between">
                    <div>
                        <div className="flex flex-row-reverse justify-between mb-8"><span>:پلن</span><span>{plan?.name}</span></div>
                        <div className="flex flex-row-reverse justify-between my-8"><span>:تعداد کاربر</span><span>{plan?.user_count || 'نامحدود'}</span></div>
                        <div className="flex flex-row-reverse justify-between my-8"><span>:حجم</span><span>{plan?.data_size} GB</span></div>
                        <div className="flex flex-row-reverse justify-between mt-8"><span>:زمان</span><span className="dir-rtl">{plan?.month} ماهه</span></div>
                    </div>
                    <div className='border-t-2 border-blue-300 mt-10 mb-5'>
                        <div className="flex flex-row-reverse justify-between my-6"><span>:مبلغ</span><span className='dir-rtl'>{addCommaToPrice(plan?.price)} تومان</span></div>
                        <div className="flex flex-row-reverse justify-between my-6"><span>:کیف پول</span><span className='dir-rtl'>{addCommaToPrice(user.wallet)} تومان</span></div>
                    </div>
                    <div className='border-t-2 border-blue-500 border-dashed my-3'>
                        <div className="flex flex-row-reverse justify-between my-6"><span>:قابل پرداخت</span><span className='dir-rtl'>{addCommaToPrice((user.wallet - plan?.price) > 0 ? 0 :((user.wallet - plan?.price) * -1))} تومان</span></div>
                    </div>
                    <div className='flex justify-center items-center bg-main-blue rounded-md w-full sticky bottom-4'>
                        <button className='py-2 text-white font-bold'>پرداخت و تمدید</button>
                    </div>
                </div>
            </Modal>
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