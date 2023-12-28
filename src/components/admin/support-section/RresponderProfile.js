import React from 'react';
import styles from './RresponderProfile.module.css';
import userProfile from '../assets/profile.png'

const RresponderProfile = ({ticket}) => {
    return (
        <div className={styles.profile}>
            <div className={styles.profileContainer}>
                <p className={styles.fullName}>{ticket.user?.full_name}</p>
                <p className={styles.updatedAt}>{ticket.updatedAt}</p>
            </div>
            <img className={styles.profileImage} alt='profile' src={userProfile} />
            <div className="bg-blue-300"></div>
        </div>
    );
};

export default RresponderProfile;