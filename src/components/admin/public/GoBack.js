import React from 'react';
import backArrow from '../assets/Arrow_right_long.svg';
import styles from './GoBack.module.css'
import { Link } from 'react-router-dom';

const GoBack = ({path}) => {
    return (
        <Link to={path}>
            <div className={styles.goBack}>
                <img src={backArrow} alt='back' className={styles.back} />
                <p>بازگشت</p>
            </div>
        </Link>
    );
};

export default GoBack;