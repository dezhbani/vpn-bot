import React, { useState } from 'react';
import { Button } from '@mui/material';
import addUser from '../assets/user/addUser.svg'
import editUser from '../assets/user/edit.svg'
import deleteUser from '../assets/user/Trash.svg'
import styles from './Navbar.module.css'
import AddUser from './AddUser';
import DeleteUser from './DeleteUser';
import EditUser from './EditUser';
const Navbar = ({data, editedID, setEditedID}) => {
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const handleOpenAdd = () =>{ 
        setOpenAdd(!openAdd);
    }
    const handleOpenEdit = () =>{
        setOpenEdit(!!editedID.ID);
        setEditedID({...editedID, edit: !openEdit});
    }
    const handleOpenDelete = () =>{ 
        window.alert('هنوز این قسمت غیر فعاله')
        // setOpenDelete(!openDelete);
    }

    return (
        <div className={styles.container}>
            <Button className={styles.addUserButton} onClick={handleOpenDelete}><img className={styles.addUserIcon} src={deleteUser} /></Button>
            <Button className={styles.addUserButton} onClick={handleOpenEdit}><img className={styles.addUserIcon} src={editUser} /></Button>
            <Button className={styles.addUserButton} onClick={handleOpenAdd}><img src={addUser} /></Button>
            <AddUser openAdd={openAdd} setOpenAdd={setOpenAdd} />
            {
                openEdit?
                <EditUser editedID={editedID} setEditedID={setEditedID} openEdit={openEdit} setOpenEdit={setOpenEdit} data={data}/>
                :
                ''
            }
            {/* <DeleteUser openDelete={openDelete} setOpenDelete={setOpenDelete} /> */}
        </div>
    );
};

export default Navbar;