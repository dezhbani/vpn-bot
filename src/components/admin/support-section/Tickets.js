import React, { useEffect, useState } from 'react';
import styles from './Tickets.module.css';
import { getTickets } from '../../services/support.service';
import Ticket from './Ticket';
import Sidebar from '../public/Sidebar';
import { Link } from 'react-router-dom';

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const getList = async () => setTickets(await getTickets())
    useEffect(() =>{
        getList()
    }, [])

    return (
        <div className={styles.mainContainer}>
            <Sidebar/>
            <div className={styles.container}>
                <div style={{direction: 'rtl'}} className='flex flex-col text-xl h-52 justify-center items-center w-full p-3'>
                    <p className={`mb-10 px-10 py-2 rounded-lg text-white bg-red-600 ${styles.animeBounce}`}>به زودی این قسمت فعال خواهد شد</p>
                    <p>برای پشتیبانی میتونید به آیدی تلگرام: <a className='text-blue-600 px-2 py-1 rounded transition-all duration-500 hover:bg-blue-600 hover:text-white' href='https://t.me/delltavpn'>delltavpn@</a> پیام بدید</p>                    
                </div>

                {/* <div className={styles.help}>
                    <div className={styles.help}>
                        <p className={styles.title}>تیکت ها</p>
                        <p className={styles.subTitle}>تمامِ تیکت‌هایی که برای پشتیبانی ارسال کرده‌اید، در این صفحه لیست شده‌اند</p>
                    </div>
                    <div className={styles.btnContainer}>
                        <Link to={'/dashboard/ticket/new'}>
                            <button className={styles.sendTicket}>ارسال تیکت جدید</button>
                        </Link>
                    </div>
                </div>
                <div className={styles.tickets}>
                    <div className={styles.header}>
                        <div className={styles.ID}>شناسه تیکت</div>
                        <div className={styles.title1}>موضوع تیکت</div>
                        <div className={styles.lastUpdate}>آخرین به روزرسانی</div>
                        <div className={styles.status}>وضعیت</div>
                    </div>
                    <div className={styles.ticketContainer}>
                        {
                            tickets.map(ticket => <Ticket ticket={ticket} key={ticket._id} />)
                        }
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default Tickets;