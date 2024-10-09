import React, { createContext, useEffect, useState } from 'react';
import { getUserProfile } from '../admin/services/profile.service';
import Modal from '../public/components/Modal';

export const ProfileContext = createContext()

const UserProfileContext = ({children}) => {
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const UserProfile = async () => {
        const result = await getUserProfile()
        setProfile(result)
        setLoading(false)
    }
    useEffect(() => {
        UserProfile()
    }, [])
    return (
        <div>
            <Modal isOpen={loading} loading={loading} />
            <ProfileContext.Provider value={profile}>
                {children}
            </ProfileContext.Provider>
        </div>
    );
};

export default UserProfileContext;