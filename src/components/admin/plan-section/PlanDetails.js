import React, { useState } from 'react';
import styles from './PlanDetails.module.css'
import BuyConfig from './BuyConfig';

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
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.planName}>
                    <div className={styles.name}>{data.name}</div>
                </div>
                <div className={styles.plan}>
                    <div className={styles.dataSize}>{data.data_size} گیگ</div>
                    <div className={styles.month}>{data.month} ماهه</div>
                    <div className={data.user_count == 0?styles.userCount:styles.dataSize}>{data.user_count == 0? "بدون محدودیت": `${data.user_count} کاربره`}</div>
                    <div className={styles.price}>{data.price} ت</div>
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