import React, { useState } from 'react';
import styles from './PlanDetails.module.css'
import trash from '../assets/Trash.svg'
import edit from '../assets/edit.svg'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeletePlan from './DeletePlan';
import EditPlan from './EditPlan';

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
    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.icons}>
                    <MoreVertIcon onClick={openMoreHanler}/>
                    <div className={openMore? styles.openMore:styles.closeMore}>
                        <div className={styles.moreBox}>
                            <div onClick={handleOpen} className={styles.field}><img src={edit}/> ادیت</div>
                            <div onClick={handleOpenMore} className={styles.field}><img src={trash}/> حذف</div>
                        </div>
                    </div>
                </div>
                <DeletePlan setOpenAlert={setOpenAlert} openAlert={openAlert} id={data._id} />
                <EditPlan open={open} setOpen={setOpen} data={data} />
                <div className={styles.planContainer}>
                    <div>
                        <div className={styles.name}>{data.name}</div>
                    </div>
                    <div>
                        <div className={styles.dataSize}>{data.data_size} GB</div>
                    </div>
                    <div>
                        <div className={styles.month}>{data.month} month</div>
                    </div>
                    <div>
                        <div className={data.user_count == 0?styles.userCount:styles.dataSize}>{data.user_count == 0? "Unlimited": `${data.user_count} user`}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Plan;