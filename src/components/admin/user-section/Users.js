import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import { getUsers } from '../services/users.service';
import styles from './Users.module.css'
import User from './User';
import Navbar from './Navbar';

const Users = () => {
    const [users, setUsers] = useState([]);
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
                    users.map(user => <User key={user._id} users={user}/>)
                }
            </div>
        </div>
        <Navbar data={users}/>
        </>
    );
};

export default Users;