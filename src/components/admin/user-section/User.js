import React, { useContext, useState } from 'react';
import styles from './User.module.css';
import Loading from '../public/Loading';
import { ProfileContext } from '../../context/UserProfileContext';
import UserDetails from './UserDetails';
import RepurchaseConfig from './RepurchaseConfig';

const User = ({user, editedID, setEditedID}) => {
    const [openDetails, setOpenDetails] = useState(false);
    const [openRepurchase, setOpenRepurchase] = useState(false);
    const handleOpenDetails = () => setOpenDetails(true);
    const handleOpenRepurchase = () => setOpenRepurchase(true);

    const profile = useContext(ProfileContext)
    if(!profile?.role) return <Loading />
    
    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <p>{user.full_name}</p>
                <p>{user.mobile}</p>
                <div className={styles.buttonContainer}>
                    <button className={`bg-none border-none text-blue-500`} onClick={handleOpenDetails}>جزئیات</button>
                    <button className={styles.repurchase} onClick={handleOpenRepurchase}>تمدید کانفیگ</button>
                </div>
                <UserDetails open={openDetails} setOpen={setOpenDetails} user={user} />
                <RepurchaseConfig open={openRepurchase} setOpen={setOpenRepurchase} userID={user._id} />
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