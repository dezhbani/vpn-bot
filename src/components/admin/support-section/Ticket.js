import React from 'react';
import styles from './Ticket.module.css';
import { Link } from 'react-router-dom';

const Ticket = ({ticket}) => {
    return (
        <Link to={`/dashboard/ticket/${ticket._id}`}>
            <div className={styles.mainContainer}>
                <div className={ticket.status !== 'بسته'? styles.container : `${styles.closed} ${styles.container}`}>
                    <div className={styles.ID}>{ticket._id}</div>
                    <div className={styles.title}>{ticket.title}</div>
                    <div className={styles.time}>{ticket.updatedAt}</div>
                    <div className={styles.status}>{ticket.status}</div>
                </div>
            </div>
        </Link>
    );
};

export default Ticket;