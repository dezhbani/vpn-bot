import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import { getUsers } from '../services/users.service';
import styles from './Users.module.css'
import User from './User';
import { Link } from 'react-router-dom';

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
                    users.map(plan => <Link style={{textDecoration: 'none'}} to={`/dashboard/users/${plan._id}`}><User key={plan._id} data={plan}/></Link>)
                }
            </div>
        </div>
        </>
    );
};

export default Users;