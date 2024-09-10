import React from 'react';
import LoadingIcon from '../../user/assets/Loading.svg';

const Loading = () => {
    return (
        <div className='h-full w-full flex items-center justify-center'>
            <img className='h-14 animate-spin-slow' src={LoadingIcon} alt='loading'/>
        </div>
    );
};

export default Loading;