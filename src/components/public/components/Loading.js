import React from 'react';
import { jellyTriangle } from 'ldrs'

jellyTriangle.register()
const Loading = () => {
    return (
        <div className='h-full w-full flex items-center justify-center'>
            <l-jelly-triangle
                size="45"
                speed="1.8"
                color="#0095ff"
            ></l-jelly-triangle>
        </div>
    );
};

export default Loading;