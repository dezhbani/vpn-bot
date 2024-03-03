import { Box, Button, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import styles from './AddPlan.module.css'
import { editPlan } from '../services/plan.service';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const EditPlan = ({data, open, setOpen}) => {
    const handleClose = () => setOpen(false);
    const [editData, setEditData] = useState(data)
    
    const change = event =>{
        setEditData({...editData, [event.target.name]: event.target.value});
    }
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 300,
        bgcolor: 'background.paper',
        borderRadius: '10px',
        boxShadow: 24,
        p: 4,
      };
    const sendData = async () =>{
        try {
            const addPlanResult = await editPlan(editData);
            handleClose()
            toast.success(addPlanResult.message)
            setTimeout(() => window.location.reload(true), 5000);
            
        } catch (error) {
            toast.error(error.response.data.message, {autoClose: 2000})
        }
    }
    return (
        <div>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box className={styles.box} sx={style}>
                    <div className={styles.inputBox}>
                        <TextField margin='normal' size='small' onChange={change} name='name' value={editData.name} className={styles.field} label="نام پلن" variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='price' value={editData.price} className={styles.field} label='قیمت' variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='user_count' value={editData.user_count} className={styles.field} label='تعداد کاربر' variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='data_size' value={editData.data_size} className={styles.field} label='ترافیک' variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='pay_link' value={editData.pay_link} className={styles.field} label='لینک خرید' variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='month' value={editData.month} className={styles.field} label='زمان' variant="outlined" />
                        <Button onClick={sendData}>ارسال</Button>
                    </div>
                </Box>
            </Modal>
             
        </div>
    );
};

export default EditPlan;