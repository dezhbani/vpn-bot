import React, { createContext, useEffect, useState } from 'react';
import { getUserProfile } from '../services/profile.service';

export const ProfileContext = createContext()

const UserProfileContext = ({children}) => {
    const [profile, setProfile] = useState({});
    const UserProfile = async () => {
        await getUserProfile(setProfile)
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