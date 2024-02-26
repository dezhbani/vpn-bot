import { Box, Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import styles from '../user-section/AddConfig.module.css'
import { addConfig } from '../../services/config.service';
import axios from 'axios';
import { toast } from 'react-toastify';
import { headers } from '../../public/function';
import Modal from '../../public/components/Modal';

const UpdateWallet = ({setOpen, open, userID}) => {
    const [data, setData] = useState({})
    const [loading, setLoading] = useState(false)
    const handleClose = () => setOpen(false);
    const change = event =>{
        setData({...data, [event.target.name]: event.target.value});
    }
    const sendData = async () =>{
        setLoading(true)
        const result = await axios.patch(`admin/user/wallet/${userID}`, {
            pay: data.wallet
        }, headers).catch(err => {
            handleClose()
            setLoading(false)
            toast.error(err.response?.data?.message)
        })
        if (result?.data) {
            document.location.replace(result.data?.payLink)
            handleClose()
        }
    }
    return (
        <Modal isOpen={open} onClose={handleClose} loading={loading}>
            <h2>شارژ حساب کاربری</h2>
            <div className={styles.inputBox}>
                <TextField margin='normal' size='small' onChange={change} name='wallet' value={data.wallet} className={styles.field} label='(تومان)مبلغ' variant="outlined" />
                <Button onClick={sendData}>پرداخت</Button>
            </div>
        </Modal>
    );
};

export default UpdateWallet;