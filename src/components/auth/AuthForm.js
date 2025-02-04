import React, { useContext, useState } from 'react';
import GetMobile from './GetMobile';
import GetOtp from './GetOtp';
import 'react-toastify/dist/ReactToastify.css';
import { Navigate } from 'react-router-dom';
import Modal from '../public/components/Modal';
import SelectPanel from './SelectPanel';
import { ProfileContext } from '../context/UserProfileContext';

const Auth = () => {
    const userRoles = ['customer']
    const adminRoles = ['admin', 'owner']
    const [loading, setLoading] = useState(false);
    const [ state, setState ] = useState({sendOTP: false, mobile: ''})
    const data = useContext(ProfileContext)
    // const [ data ] = useState({})
    const UserRole = data?.role || ''
    const splitedRoles = UserRole.split(',')  

    // const UserProfile = async () => {
    //     const result = await getUserProfile()
    // }
    // useEffect(() => {
    //     UserProfile()
    // }, [!!data == false])

    const isUser = splitedRoles.some(role => userRoles.includes(role));
    const isAdmin = splitedRoles.some(role => adminRoles.includes(role));
    
    const checkOTP = () => {
        if(state.sendOTP) return <GetOtp setLoading={setLoading} state={state} />
        return <GetMobile setLoading={setLoading} setState={setState} state={state} />
    }
    
    const checkProfile = () => { 
        switch (data.status) {
            case 200:
                if(!data.first_name || !data.last_name || !data.full_name) return <Navigate to="/complete-signup" />  
                if(isAdmin && isUser) return <SelectPanel />
                else if(data.role == "owner") return <Navigate to="/dashboard" />
                else if(data.role == "customer") return <Navigate to="/home" />
            case 401:
                return <div className='bg-white shadow-[2px_4px_30px_0px_#00000010] rounded-lg min-h-80 w-fit h-fit'>{checkOTP()}</div>
        }
    }
    return (
        <div className='flex justify-center bg-[#f9f9f9] min-h-screen items-center'>
                {   
                    checkProfile()
                }
            <Modal isOpen={loading} loading={loading} />
        </div>
    );
};

export default Auth;