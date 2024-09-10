import React, { createContext, useEffect, useState } from 'react';
import { getUserProfile } from '../admin/services/profile.service';

export const ProfileContext = createContext()

const UserProfileContext = ({children}) => {
    const [profile, setProfile] = useState({});
    const UserProfile = async () => {
        const result = await getUserProfile()
        setProfile(result)
    }
    useEffect(() => {
        UserProfile()
    }, [])
    return (
        <div>
            <ProfileContext.Provider value={profile}>
                {children}
            </ProfileContext.Provider>
        </div>
    );
};

export default UserProfileContext;