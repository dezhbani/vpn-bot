import { Box, Button, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import styles from '../user-section/AddConfig.module.css'
import { addConfig } from '../../services/config.service';
import axios from 'axios';
import { toast } from 'react-toastify';
import { headers } from '../../public/function';

const UpdateWallet = ({setOpen, open, userID}) => {
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
        const result = await axios.patch(`admin/user/wallet/${userID}`, {
            pay: data.wallet
        }, headers).catch(err => {
            console.log(err);
            toast.error(err.response?.data?.message)
        })
        console.log(result);
        if (result) {
            
        }
        document.location.href = result.data?.payLink
            handleClose()
    }
    return (
        <div className={styles.box}>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={style}>
                    <h2>شارژ حساب کاربری</h2>
                    <div className={styles.inputBox}>
                        <TextField margin='normal' size='small' onChange={change} name='wallet' value={data.wallet} className={styles.field} label='(تومان)مبلغ' variant="outlined" />
                        <Button onClick={sendData}>پرداخت</Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default UpdateWallet;