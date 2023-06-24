import { Box, Button, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import styles from './AddPlan.module.css'
import add from '../assets/add.svg'
import { addPlan } from '../services/plan.service';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

const AddPlan = () => {
    
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [open, setOpen] = useState(false);
    const [data, setData] = useState({})

    const change = event =>{
        setData({...data, [event.target.name]: event.target.value});
        console.log(data);
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
            const addPlanResult = await addPlan(data);
            handleClose()
            toast.success(addPlanResult.message)
            setTimeout(() => window.location.reload(true), 5000);
            
        } catch (error) {
            toast.error(error.response.data.message, {autoClose: 2000})
        }
    }
    return (
        <div className={styles.addPlan}>
            <Button onClick={handleOpen}><img src={add} /></Button>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={style}>
                    <div className={styles.inputBox}>
                        <TextField margin='normal' size='small' onChange={change} name='name' value={data.name} className={styles.field} label="نام پلن" variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='price' value={data.price} className={styles.field} label='قیمت' variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='user_count' value={data.user_count} className={styles.field} label='تعداد کاربر' variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='data_size' value={data.data_size} className={styles.field} label='ترافیک' variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='pay_link' value={data.pay_link} className={styles.field} label='لینک خرید' variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='month' value={data.month} className={styles.field} label='زمان' variant="outlined" />
                        <Button onClick={sendData}>ارسال</Button>
                    </div>
                </Box>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default AddPlan;