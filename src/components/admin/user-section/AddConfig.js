import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, TextField } from '@mui/material';
import React, { useState } from 'react';
import styles from './AddConfig.module.css'
import add from '../assets/add.svg'
import { addPlan, getPlans } from '../services/plan.service';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { addConfig } from '../services/config.service';

const AddConfig = ({plans, setOpen, open}) => {
    
    const [data, setData] = useState({})
    const [selectedValue, setSelectedValue] = useState('');
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
    const handleChange = (event) => {
      setSelectedValue(event.target.value);
    };
    const sendData = async () =>{
        try {
            data.planID = selectedValue
            const addPlanResult = await addConfig(data);
            handleClose()
            toast.success(addPlanResult.message)
            setTimeout(() => window.location.reload(true), 5000);
            
        } catch (error) {
            toast.error(error.response.data.message, {autoClose: 2000})
        }
    }
    return (
        <div className={styles.addPlan}>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={style}>
                    <div className={styles.inputBox}>
                        <TextField margin='normal' size='small' onChange={change} name='mobile' value={data.mobile} className={styles.field} label='موبایل' variant="outlined" />
                        <FormControl>
                            <InputLabel id="dropdown-label">Select an option</InputLabel>
                            <Select labelId="dropdown-label" id="dropdown-input" value={selectedValue} onChange={handleChange}>
                                {
                                    plans.map(plan => <MenuItem key={plan._id} value={plan._id}>{plan.name}</MenuItem>)
                                }
                            </Select>
                        </FormControl>
                        <Button onClick={sendData}>ارسال</Button>
                    </div>
                </Box>
            </Modal>
            <ToastContainer />
        </div>
    );
};

export default AddConfig;