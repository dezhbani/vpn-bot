import React, { useState } from 'react';
import styles from './PlanDetails.module.css'
import BuyConfig from './BuyConfig';
import { addCommaToPrice } from '../../public/function';

const Plan = ({data}) => {
    const [open, setOpen] = useState(false);
    const [openMore, setOpenMore] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const handleOpenMore = () => setOpenAlert(true);
    const handleOpen = () => setOpen(true);
    
    const openMoreHanler = () => {
        setOpenMore(!openMore)
    }


//     <div className={styles.icons}>
//     <img src={More} onClick={openMoreHanler}/>
//     <div className={openMore? styles.openMore:styles.closeMore}>
//         <div className={styles.moreBox}>
//             <div onClick={handleOpen} className={styles.field}><img src={edit}/> ادیت</div>
//             <div onClick={handleOpenMore} className={styles.field}><img src={trash}/> حذف</div>
//         </div>
//     </div>
// </div>
// <DeletePlan setOpenAlert={setOpenAlert} openAlert={openAlert} id={data._id} />
// <EditPlan open={open} setOpen={setOpen} data={data} />

    return (
        <div className="flex dir-rtl text-end text-sm sm:text-lg">
            <div className="flex flex-wrap m-2 bg-white shadow-md rounded-lg dir-rtl flex-col p-2 sm:p-4 sm:m-5">
                <div className="border-x-2 mt-12 flex justify-center border-blue-600 border-solid">
                    <p>{data.name}</p>
                </div>
                <div className="flex w-52 h-60 flex-col justify-center sm:w-72 sm:h-72">
                    <div className="flex justify-center border-b-[1px] border-[silver] p-1">{data.data_size == 0? "نامحدود": `${data.data_size} گیگ`}</div>
                    <div className="flex justify-center border-b-[1px] border-[silver] p-1">{data.month} ماهه</div>
                    <div className="flex justify-center border-b-[1px] border-[silver] p-1">{data.user_count == 0? "بدون محدودیت کاربر": `${data.user_count} کاربره`}</div>
                    <div className="flex justify-center border-b-[1px] border-[silver] p-1">{addCommaToPrice(data.price)} ت</div>
                </div>
                <div className={styles.buttonContainer}>
                    <button className={styles.newConfig} onClick={handleOpen}>ثبت کانفیگ</button>
                </div>
                <BuyConfig open={open} setOpen={setOpen} plan={data} />
            </div>
        </div>
    );
};

export default Plan;