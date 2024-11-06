import React, { useContext, useState } from 'react';
import SettingIcon from '../../assets/SettingBlue.svg';
import EditIcon from '../../assets/EditBlue.svg';
import { ProfileContext } from '../../../context/UserProfileContext';
import Modal from '../../../public/components/Modal';
import { addCommaToPrice } from '../../../public/function';

const Invoice = ({ plan, invoice, handleClose }) => {
    const user = useContext(ProfileContext)

    return (
        <Modal isOpen={invoice} onClose={handleClose}>
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
                    <div className="flex flex-row-reverse justify-between my-6"><span>:قابل پرداخت</span><span className='dir-rtl'>{addCommaToPrice((user.wallet - plan?.price) > 0 ? 0 : ((user.wallet - plan?.price) * -1))} تومان</span></div>
                </div>
                <div className='flex justify-center items-center bg-main-blue rounded-md w-full sticky bottom-4'>
                    <button className='py-2 text-white font-bold'>پرداخت و تمدید</button>
                </div>
            </div>
        </Modal>
    )
}

const Options = ({plan}) => {
    // const [openSetting, setOpenSetting] = useState(false)
    
    const [invoice, setInvoice] = useState(false);
    const handleClose = () => setInvoice(false)
    const handleOpen = () => setInvoice(true)

    return (
        <>
            <Invoice plan={plan} invoice={invoice} handleClose={handleClose} />
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