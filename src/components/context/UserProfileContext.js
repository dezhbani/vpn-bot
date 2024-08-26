import React, { createContext, useEffect, useState } from 'react';
import { getUserProfile } from '../services/profile.service';

export const ProfileContext = createContext()

const UserProfileContext = ({children}) => {
    const [profile, setProfile] = useState({});
    const UserProfile = async () => {
        const result = await getUserProfile()
        setProfile(result)
        console.log(result);
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