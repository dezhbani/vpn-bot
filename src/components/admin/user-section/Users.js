import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import { getUsers } from '../../services/users.service';
import User from './User';
import { copyElement } from '../../public/function';
import Skeleton from 'react-loading-skeleton';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [editedID, setEditedID] = useState({
        ID: '', 
        edit: false
    });
    useEffect(() => {
        const allUsers = async () => {
            const allUser = await getUsers()
            setUsers(allUser?.users)
        }
        allUsers()
        document.title = 'dashboard';
    }, []);
    
    return (
        <>
            <Sidebar />
            {
                <div>
                    <div className="w-[calc(100%-72px)] flex sm:w-3/4 lg:w-5/6 xl:w-[85%]">
                        <div className="w-full dir-rtl m-3 flex-wrap flex justify-start">
                            {
                                users?.length? 
                                    users?.map(user => <User key={user._id} editedID={editedID} setEditedID={setEditedID} user={user}/>) : 
                                    (
                                        users == null?
                                            <div className='flex justify-center items-center w-full h-[90vh] font-[b-kamran] font-extrabold'>کاربری وجود ندارد</div>:
                                            copyElement(<Skeleton className='w-[330px] h-[150px] m-5 px-5 py-[10px] flex-wrap rounded-md' />, 9)
                                    )
                            }
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default Users;