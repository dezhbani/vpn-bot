import { useContext } from "react"
import { ProfileContext } from "../../context/UserProfileContext"
import Modal from "../../public/components/Modal"
import { addCommaToPrice } from "../../public/function"

const Invoice = ({ plan, open, handleClose, repurchase=false, handleButton }) => {
    const user = useContext(ProfileContext)

    return (
        <Modal isOpen={open} onClose={handleClose}>
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
                <div className='flex justify-center items-center bg-main-blue rounded-md w-full sticky bottom-4' onClick={handleButton}>
                    <button className='py-2 text-white font-bold'>{repurchase? 'پرداخت و تمدید' : 'پرداخت'}</button>
                </div>
            </div>
        </Modal>
    )
}

export default Invoice;