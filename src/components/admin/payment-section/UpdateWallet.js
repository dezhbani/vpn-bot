import { Button, TextField } from '@mui/material';
import React, { useState } from 'react';
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
            <div >
                <TextField margin='normal' size='small' onChange={change} name='wallet' value={data.wallet} label='(تومان)مبلغ' variant="outlined" />
                <Button onClick={sendData}>پرداخت</Button>
            </div>
        </Modal>
    );
};

export default UpdateWallet;