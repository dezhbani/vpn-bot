import React, { useState } from 'react';
import Sidebar from '../public/Sidebar';
import Tabs from '../../public/components/Tabs';
import EditProfile from './EditProfile';
import Wallet from './Wallet';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('Tab1');
    const tabData = [
        { label: 'پروفایل', content: <EditProfile /> },
        { label: 'کیف پول', content: <Wallet /> },
      ];
    return (
        <div className='h-screen'>
            <Sidebar />
            <div className='flex z-20 min-h-[78%] dir-ltr w-[calc(100%-7rem)] sm:w-[calc(75%-3.5rem)] lg:w-[calc(80%-2rem)] xl:w-4/5 ml-4 mr-6 mt-28 mb-4 lg:mt-32 rounded-xl flex-wrap font-iran-sans'>
                <Tabs tabs={tabData} />
            </div>

        </div>
    );
};

export default Profile;