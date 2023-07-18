import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, TextField } from '@mui/material';
import React, { useState } from 'react';
import styles from './AddConfig.module.css'
import add from '../assets/add.svg'
import { addPlan, getPlans } from '../services/plan.service';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { addConfig } from '../services/config.service';
import { addUser } from '../services/users.service';

const AddUser = ({openAdd, setOpenAdd}) => {
    const [data, setData] = useState({})
    const handleClose = () => setOpenAdd(false);
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
        try {
            const addUserResult = await addUser(data);
            handleClose()
            toast.success(addUserResult?.message)
        } catch (error) {
            handleClose()
            toast.error(error.response.data.message, {autoClose: 2000})
        }
    }
    return (
        <div className={styles.addPlan}>
            <Modal open={openAdd} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={style}>
                    <div className={styles.inputBox}>
                        <TextField margin='normal' size='small' onChange={change} name='first_name' value={data.first_name} className={styles.field} label="نام" variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='last_name' value={data.last_name} className={styles.field} label='نام خاموادگی' variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='mobile' value={data.mobile} className={styles.field} label='موبایل' variant="outlined" />
                        <Button onClick={sendData}>ارسال</Button>
                    </div>
                </Box>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default AddUser;