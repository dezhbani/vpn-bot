import React from 'react';
import Modal from '../public/components/Modal';

const Loading = () => {
    return (
        <div className='h-screen'>
            <Modal isOpen={true} loading={true} />
        </div>
    );
};

export default Loading;