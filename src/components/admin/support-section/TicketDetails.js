import React, { useContext, useEffect, useState } from 'react';
import { useParams, useRoutes } from 'react-router-dom';
import { getTicketByID } from '../../services/support.service';
import Sidebar from '../public/Sidebar';
import styles from './TicketDetails.module.css';
import GoBack from '../public/GoBack';
import 'react-quill/dist/quill.snow.css';
import userProfile from '../assets/profile.png'
import { ProfileContext } from '../../context/UserProfileContext';
import RresponderProfile from './RresponderProfile';

const TicketDetails = () => {
    const { _id } = useContext(ProfileContext)
    const [ticket, setTicket] = useState({})
    const { ticketID } = useParams();
    const getTicket = async () => setTicket(await getTicketByID(ticketID))
    useEffect(() =>{
        getTicket()
    }, [])
    console.log(ticket, _id);
    return (
       <div className={styles.mainContainer}>
            <Sidebar />
            <div className={styles.whiteBox}>
                <div className={styles.topBox}>
                    <GoBack path={'/dashboard/support'} />
                    <p>{ticket.title}</p>
                </div>
                <div className={styles.main}>     
                    <div className={styles.mainSection}>
                        <div className={styles.authorProfile}>
                            <div className={styles.authorProfileContainer}>
                                <p className={styles.fullName}>{ticket.user?.full_name}</p>
                                <p className={styles.updatedAt}>{ticket.updatedAt}</p>
                            </div>
                            <img className={styles.profileImage} alt='profile' src={userProfile} />
                        </div>
                        <div className={styles.description}>
                            <div>
                                <p dangerouslySetInnerHTML={{__html:  ticket.description}}/>
                            </div>
                        </div>
                        <div className={styles.repliesContainer}>
                            {/* <div className={styles.repliesMainContainer}> */}
                                {
                                    ticket.reply?.map(reply => (
                                        <div className={styles.replyBox}>
                                            <div className={reply.user._id == _id? styles.me: styles.reply}>
                                                {/* <RresponderProfile ticket={ticket} /> */}
                                                <div className={styles.profile}>
                                                    <div className={styles.profileContainer}>
                                                        <p className={styles.fullName}>{ticket.user?.full_name}</p>
                                                        {/* <p className={styles.updatedAt}>{ticket.updatedAt}</p> */}
                                                    </div>
                                                    {/* <img className={styles.profileImage} alt='profile' src={userProfile} /> */}
                                                    {/* <div className="bg-blue-300"></div> */}
                                                </div>
                                                <div>{reply.reply}</div>
                                            </div>
                                        </div>
                                    ))
                                }
                            {/* </div> */}
                        </div>
                    </div>
                </div>
            </div>
       </div>
    );
};

export default TicketDetails;