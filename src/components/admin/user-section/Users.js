import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import { getUsers } from '../../services/users.service';
import styles from './Users.module.css'
import User from './User';
import logo from '../assets/delta-vpn-logo.webp'
import Forbidden from '../public/errors/Forbidden';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState(0);
    const [editedID, setEditedID] = useState({
        ID: '', 
        edit: false
    });
    useEffect(() => {
        const allUsers = async () => {
            const allUser = await getUsers()
            setUsers(allUser?.users)
            setStatus(allUser?.status)
            console.log(status);
        }
        allUsers()
        document.title = 'dashboard';
    }, []);
    // const lastPlan = lastIndex(users.bills)
    // if(status) return (
    //     <>
    //         <Sidebar />
    //         <Forbidden />
    //     </>
    // )
    
    return (
        <>
        <Sidebar />
        {
            <div>
                <div className={styles.mainContainer}>
                    <div className={styles.container}>
                        {
                            users?.map(user => <User key={user._id} editedID={editedID} setEditedID={setEditedID}  user={user}/>)
                        }
                    </div>
                </div>
            </div>
        }
        </>
    );
};

export default Users;