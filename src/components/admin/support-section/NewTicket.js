import React from 'react';
import styles from './NewTicket.module.css';
import Sidebar from '../public/Sidebar';
import backArrow from '../assets/Arrow_right_long.svg';

import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Link } from 'react-router-dom';
import { createTicket } from '../../services/support.service';
import GoBack from '../public/GoBack';



const NewTicket = () => {
    const [data, setData] = useState({title: '', description: ''});
    const [desc, setDesc] = useState('');
    const change = event =>{
        setData({...data, [event.target.name]: event.target.value});
    }
    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            ['clean']

        ]
    }

    const sendTicket = async () => {
        setData({...data, description: desc})
        console.log(data.description);
        await createTicket(data)
    }
    return (
        <div className={styles.mainContainer}>
            <Sidebar />
            <div className={styles.whiteBox}>
                <div className={styles.topBox}>
                    <GoBack path={'/dashboard/support'} />
                </div>
                <div className={styles.formContainer}>
                    <div className={styles.form}>
                        <input className={styles.title} name='title' value={data.title} onChange={change} placeholder='عنوان تیکت' />
                        <div className={styles.description}>
                            <ReactQuill 
                                modules={modules}
                                theme='snow'
                                placeholder='متن تیکت'
                                style={{height: "200px", width: "400px"}} 
                                name='description'
                                value={desc} 
                                onChange={setDesc} />
                        </div>
                        <button onClick={sendTicket} className={`bg-blue-500 text-white m-4 font-semibold rounded-md ${styles.sendBtn}`}>ارسال تیکت</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default NewTicket;