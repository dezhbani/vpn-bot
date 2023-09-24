import { Box, Button, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import styles from '../user-section/AddConfig.module.css'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { addConfig } from '../services/config.service';

const BuyConfig = ({plan, setOpen, open}) => {
    const [data, setData] = useState({})
    const handleClose = () => setOpen(false);
    const change = event =>{
        setData({...data, [event.target.name]: event.target.value});
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
            data.planID = plan._id
            await addConfig(data);
            handleClose()
    }
    return (
        <div className={styles.addPlan}>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={style}>
                    <div className={styles.inputBox}>
                        <TextField margin='normal' size='small' onChange={change} name='mobile' value={data.mobile} className={styles.field} label='موبایل' variant="outlined" />
                        <Button onClick={sendData}>ارسال</Button>
                    </div>
                </Box>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default BuyConfig;