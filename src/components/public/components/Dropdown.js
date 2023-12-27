import React, { useState } from 'react';
import ArrowDown from '../../admin/assets/ArrowDown.svg';
import ArrowUp from '../../admin/assets/ArrowUp.svg';
import styles from './Dropdown.module.css'

const Dropdown = ({className, header, component, title=''}) => {
    const [ open, setOpen ] = useState(false)
    const handleOpen = () => {
        setOpen(!open)
    }

    return (
        <div className={`${className} ${styles.container}`}>
            <div className='flex text-white bg-blue-300 w-[100%] rounded-xl px-2 py-[2px]' onClick={handleOpen} >
                <h2 className={header}>{title}</h2>
                <img className={styles.arrow} src={open? ArrowUp : ArrowDown} />
            </div>
            <div className={!open ? `hidden`: styles.component }>
                {
                    component
                }
            </div>
        </div>
    );
};

export default Dropdown;