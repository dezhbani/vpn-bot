import React, { useContext, useState } from 'react';
import styles from './User.module.css';
import { lastIndex } from '../../public/function';
import Loading from '../public/Loading';
import { ProfileContext } from '../../context/UserProfileContext';
import UserDetails from './UserDetails';
import { repurchase } from '../../services/users.service';

const User = ({user, editedID, setEditedID}) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const changeHandler = event =>{
        setEditedID({edit: true, ID: event.target.value})
    }

    const repurchaseHandler = () => {
        console.log(user.configs);
        repurchase(user._id)
    }

    const profile = useContext(ProfileContext)
    if(!profile?.role) return <Loading />
    const lastPlan = lastIndex(user.bills);
    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <p>{user.full_name}</p>
                <p>{user.mobile}</p>
                <div className={styles.buttonContainer}>
                    <button className={`bg-none border-none text-blue-500`} onClick={handleOpen}>جزئیات</button>
                    <button className={styles.repurchase} onClick={repurchaseHandler}>تمدید کانفیگ</button>
                </div>
                <UserDetails open={open} setOpen={setOpen} user={user} />
            </div>
            {/*   */}
        </div>
    );
};

export default User;

// {editedID.edit ?
//     <div className={styles.radioContainer}>
//         <FormControl>
//             <RadioGroup aria-labelledby="demo-radio-buttons-group-label" defaultValue="female" name="radio-buttons-group" >
//                 <FormControlLabel checked={editedID.ID == users._id} onChange={changeHandler} value={users._id} control={<Radio />}/>
//             </RadioGroup>
//         </FormControl>
//     </div>
//     :
//     <div className={styles.imageContainer}>
//         < img alt='profile' className={styles.image} src={profile} />
//     </div>
//     }
// <Link style={{textDecoration: 'none'}} to={`/dashboard/users/${users._id}`}>
//     <div className={styles.profile}>
//         <div className={styles.profileContainer}>
//             <div className={styles.name}>نام:<span> {users.full_name}</span></div>
//             <div className={styles.mobile}>موبایل: {`${users.mobile}`}</div>
//             <div>{lastPlan?.planID? `بسته فعلی: ${lastPlan.planID.name}`:'بسته ای خریداری نشده'}</div>
//         </div>
//     </div>
// </Link>