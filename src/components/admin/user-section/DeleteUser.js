import { Box, Button, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import styles from './DeleteUser.module.css'
const DeleteUser = ({setOpenDelete, openDelete}) => {
    const [data, setData] = useState({})
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 200,
        bgcolor: 'background.paper',
        borderRadius: '10px',
        boxShadow: 24,
        p: 4,
    };
    const confirmDelete = async () => {
        // try {
        //     // const deleteResult = await deletePlan(id)
        //     handleClose()
        //     toast.success(deleteResult.message)
        //     setTimeout(() => window.location.reload(true), 5000);
        // } catch (error) {
        //     handleClose()
        //     toast.error(error.response.data.message, {autoClose: 2000})
        //     setTimeout(() => window.location.reload(true), 2500);
        // }
    }
    const change = event =>{
        setData({...data, [event.target.name]: event.target.value});
        console.log(data);
    }
    const handleClose = () => setOpenDelete(false);
    return (
        <div>
            <Modal open={openDelete} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <div className={styles.alert}>
                    <Box sx={style}>
                        <div>شماره موبایل کاربر رو وارد کن</div>
                        <TextField margin='normal' size='small' onChange={change} name='mobile' value={data.mobile} className={styles.field} label='موبایل' variant="outlined" />
                        <Button onClick={confirmDelete}>تایید</Button>
                        <Button onClick={handleClose}>کنسل</Button>
                    </Box>
                </div>
            </Modal>
        </div>
    );
};

export default DeleteUser;