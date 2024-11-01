import React, { useState } from 'react';
import Sidebar from '../public/Sidebar';
import Navbar from '../public/Navbar';
import Tabs from '../../public/components/Tabs';
import EditProfile from './EditProfile';
import Wallet from './Wallet';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('Tab1');

    // Define a function to handle tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    const tabData = [
        { label: 'پروفایل', content: <EditProfile /> },
        { label: 'کیف پول', content: <Wallet /> },
      ];
    return (
        <div className='h-screen'>
            <Sidebar />
            <Navbar />
            <div className='flex min-h-[78%] z-20 dir-ltr bg-white w-4/5 shadow-[2px_4px_30px_0px_#00000010] mx-5 mt-32 rounded-xl'>
                <Tabs tabs={tabData} />
            </div>

        </div>
    );
};

export default Profile;