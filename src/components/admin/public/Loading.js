import React, { useContext } from 'react';
import { ProfileContext } from '../../context/UserProfileContext';
import { Navigate } from 'react-router-dom';

const Loading = () => {

    const profile = useContext(ProfileContext)
    if(!profile || profile?.role == 'customer' || profile?.message) return <Navigate to="/sign-up" />
    return (
        <div className="w-full h-full">
            <div className="flex justify-center items-center w-1">
                <div className="relative flex h-10 w-10 m-2" >
                    <span className="animate-bounce absolute inline-flex h-full w-full m-1 p-1 rounded-full bg-sky-300" style={{animationDelay: "0.2s", animationDirection: "1s"}}></span>
                </div>
                <div className="relative flex h-10 w-10 m-2" >
                    <span className="animate-bounce absolute inline-flex h-full w-full m-1 p-1 rounded-full bg-sky-400" style={{animationDelay: "0.4s", animationDirection: "1s"}}></span>
                </div>
                <div className="relative flex h-10 w-10 m-2" >
                    <span className="animate-bounce absolute inline-flex h-full w-full m-1 p-1 rounded-full bg-sky-500 transition duration-500 text-blue-500 animate-color-change" style={{animationDelay: "0.6s", animationDirection: "1s"}}></span>
                </div>
            </div>
        </div>
    );
};

export default Loading;