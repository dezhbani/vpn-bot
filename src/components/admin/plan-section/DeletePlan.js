import { Box, Button, Modal } from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';
import { deletePlan } from '../services/plan.service';
import 'react-toastify/dist/ReactToastify.css';
import styles from './DeletePlan.module.css'
const DeletePlan = ({id, setOpenAlert, openAlert}) => {
    const style = {
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 130,
        bgcolor: 'background.paper',
        borderRadius: '10px',
        boxShadow: 24,
        p: 4,
    };
    const confirmDelete = async () => {
        try {
            const deleteResult = await deletePlan(id)
            handleClose()
            toast.success(deleteResult.message)
            setTimeout(() => window.location.reload(true), 5000);
        } catch (error) {
            handleClose()
            toast.error(error.response.data.message, {autoClose: 2000})
            setTimeout(() => window.location.reload(true), 2500);
        }
    }
    const handleClose = () => setOpenAlert(false);
    return (
        <div>
            <Modal open={openAlert} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <div className={styles.alert}>
                    <Box sx={style}>
                        <div>میخوای حذف کنی؟</div>
                        <Button onClick={confirmDelete}>تایید</Button>
                        <Button onClick={handleClose}>کنسل</Button>
                    </Box>
                </div>
            </Modal>
        </div>
    );
};

export default DeletePlan;