import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import { getUsers } from '../services/users.service';
import styles from './Users.module.css'
import User from './User';
import Navbar from './Navbar';
import logo from '../assets/delta-vpn-logo.webp'
import { lastIndex } from '../../public/function';

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
    }, []);
    // const lastPlan = lastIndex(users.bills)
    return (
        <>
        <Sidebar />
        {
            users? 
                <div>
                    <div className={styles.mainContainer}>
                        <div className={styles.container}>
                            {
                                users?.map(user => <User key={user._id} editedID={editedID} setEditedID={setEditedID}  users={user}/>)
                            }
                        </div>
                    </div>
                </div>: 
                <div className={styles.logoContainer}>
                    <img src={logo} alt='logo' className={styles.logo} />
                </div>
        }
        </>
    );
};

export default Users;