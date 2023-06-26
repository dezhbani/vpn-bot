import React from 'react';
import styles from './Config.module.css';

const Config = ({config}) => {
    const date = new Date(+config.expiry_date);
    const now = new Date().getTime()
    console.log( date < now );
    const IRDate = date.toLocaleDateString('fa-IR')
    return (
        <div className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.name}>{config?.name}</div>
                <div className={styles.time}>{date < now?'تمام شده':IRDate }</div>
                <div><button onClick={() => {navigator.clipboard.writeText(config?.config_content)}} className={styles.copyConfig}>کپی کانغیگ</button></div>
            </div>
        </div>
    );
};

export default Config;