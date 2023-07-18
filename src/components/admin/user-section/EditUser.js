import { Box, Button, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import styles from '../plan-section/AddPlan.module.css'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { editUser } from '../services/users.service';

const EditUser = ({data, editedID, openEdit, setOpenEdit, setEditedID}) => {
    const userData = (data.filter(user => user._id == editedID.ID))[0]
    const [editData, setEditData] = useState(userData)
    const handleClose = () => {
        setOpenEdit(false);
        setEditedID({edit: false, ID: ''})
    }
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
            const editUserResult = await editUser(editData);
            handleClose()
            toast.success(editUserResult.message)
            setTimeout(() => window.location.reload(true), 5000);
            
        } catch (error) {
            toast.error(error.response.data.message, {autoClose: 2000})
        }
    }
    return (
        <div>
            <Modal open={openEdit} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box className={styles.box} sx={style}>
                    <div className={styles.inputBox}>
                        <TextField margin='normal' size='small' onChange={change} name='first_name' value={editData.first_name} className={styles.field} label="نام پلن" variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='last_name' value={editData.last_name} className={styles.field} label='قیمت' variant="outlined" />
                        <TextField margin='normal' size='small' onChange={change} name='mobile' value={editData.mobile} className={styles.field} label='تعداد کاربر' variant="outlined" />
                        <Button onClick={sendData}>ارسال</Button>
                    </div>
                </Box>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default EditUser;