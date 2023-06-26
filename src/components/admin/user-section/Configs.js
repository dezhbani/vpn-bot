import React from 'react';
import styles from './Configs.module.css';
import Config from './Config';

const Configs = ({configs}) => {
    console.log(configs);
    return (
        <div>
            {
                configs?.map(config => <Config key={config._id} config={config} />)
            }
        </div>
    );
};

export default Configs;