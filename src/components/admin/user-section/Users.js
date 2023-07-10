import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import { getUsers } from '../services/users.service';
import styles from './Users.module.css'
import User from './User';
import Navbar from './Navbar';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [editedID, setEditedID] = useState({
        ID: '', 
        edit: false
    });
    useEffect(() => {
        const allUsers = async () => {
            const allUser = await getUsers()
            setUsers(allUser)
        }
        allUsers()
        document.title = 'dashboard';
    }, [])
    return (
        <>
        <Sidebar />
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                {
                    users.map(user => <User key={user._id} editedID={editedID} setEditedID={setEditedID}  users={user}/>)
                }
            </div>
        </div>
        <Navbar editedID={editedID} setEditedID={setEditedID} data={users}/>
        </>
    );
};

export default Users;