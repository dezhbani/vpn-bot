import React, { useState } from 'react';
import styles from './Config.module.css';
import { timestampToTime } from '../../public/function';
import Tooltip from '../../public/components/Tooltip';

const Config = ({config, selected, setSelected}) => {
    const [touched, setTouched] = useState(false);
    const focus = () =>{
        setTouched(!touched);
        if(!touched){
            setSelected([...selected, config.configID])
        }else{
            const otherSelected = selected.filter(ID => ID !== config.configID);
            setSelected(otherSelected)
        }
    }
    return (
        <div className={styles.mainContainer}>
            <div onClick={focus} className={touched? styles.selected: styles.container}>
                <div className={styles.name}>{config.name}</div>
                <div className={styles.expiry}><Tooltip text={'تاریخ اتمام'}>{timestampToTime(config.expiry_date, false)}</Tooltip></div>
                <div className={styles.port}><Tooltip text={'پورت'}>{config.port}</Tooltip></div>
            </div>
        </div>
    );
};

export default Config;