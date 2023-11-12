import React, { useContext, useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
// import { useHistory } from 'react-router-dom';
import { ProfileContext } from '../../context/UserProfileContext'
import Loading from '../public/Loading';
import { getUserProfile } from '../../services/profile.service';

const HomePage = () => {
    // const [profile, setProfile] = useState()
    // const profile = useContext(ProfileContext)
    // const userProfile = async () => {
    //     const sss= await getUserProfile(setProfile)
    //     // if(profile.role !== "user") redirect('/sign-up')
    // }
    // userProfile()
    return (
        <div>
            <Sidebar>
                <h1>home</h1>
            </Sidebar>
        </div>
    );
};

export default HomePage;