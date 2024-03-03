// import { Box, Modal } from '@mui/material';
import React, { useEffect, useState } from 'react';
import styles from './Receipt.module.css'
import { getBillDetails } from '../../services/users.service';
import { AD2solarDate, timestampToTime } from '../../public/function';
import Dropdown from '../../public/components/Dropdown';
import Modal from '../../public/components/Modal';

const Receipt = ({setOpen, open, bill}) => {
    const [data, setData] = useState({})
    const handleClose = () => {
        setOpen(false);

    }
    const userBills = async () => {
        const allBills = await getBillDetails(bill._id)
        setData(allBills)
        console.log(allBills);
    }
    useEffect(() =>{
        if(open) userBills()
    }, [open])

    const LiStyle = "flex items-center justify-between gap-4 py-2 text-sm transition-all last:border-none lg:text-base"
    const Payment = ({payment}) => {
        return (
            <>
                <ul>
                    <li className={LiStyle}>
                        <span className="select-none">شماره پیگیری</span>
                        <span>{payment.invoiceNumber}</span>
                    </li>
                    <li className={LiStyle}>
                        <span className="select-none">{payment.verify? "مبلغ پرداخت شده": "مبلغ قابل پرداخت"}</span>
                        <span>{payment.amount}</span>
                    </li>
                    <li className={LiStyle}>
                        <span className="select-none">وضعیت پرداخت</span>
                        <span>{payment.verify? "پرداخت شده": "پرداخت نشده"}</span>
                    </li>
                </ul>
            </>
        )
    }
    const Plan = ({plan}) => {
        return (
            <>
                <ul>
                    <li className={LiStyle}>
                        <span className="select-none ">نام</span>
                        <span>{plan.name}</span>
                    </li>
                    <li className={LiStyle}>
                        <span className="select-none">حجم</span>
                        <span className={styles.plan_DataSize}>{plan.data_size} GB</span>
                    </li>
                    <li className={LiStyle}>
                        <span className="select-none">قیمت</span>
                        <span>{plan.price}</span>
                    </li>
                    <li className={LiStyle}>
                        <span className="select-none">زمان</span>
                        <span>{plan.month} ماهه</span>
                    </li>
                    <li className={LiStyle}>
                        <span className="select-none">تعداد کاربر</span>
                        <span>{plan.user_count == 0? "بدون محدودیت": `${plan.user_count} کاربره`}</span>
                    </li>
                </ul>
            </>
        )
    }
    const User = ({user}) => {
        return (
            <>
                <ul>
                    <li className={LiStyle}>
                        <span className="select-none">اسم کاربر</span>
                        <span>{user.full_name}</span>
                    </li>
                    <li className={LiStyle}>
                        <span className="select-none">شماره موبایل کاربر</span>
                        <span>{user.mobile}</span>
                    </li>
                    {/* <li className={styles.lineContainer}>
                        <span className={`select-none ${styles.line}`}>شماره موبایل کاربر</span>
                        <span className={styles.textOnLine}>{user.mobile}</span>
                    </li> */}
                </ul>
            </>
        )
    }
    const Bill = () => {
    const date = AD2solarDate(bill.buy_date)
        return (
            <>
                <ul>
                    <li className={LiStyle}>
                        <span className="select-none">بابت</span>
                        <span>{bill.for?.description}</span>
                    </li>
                    <li className={LiStyle}>
                        <span className="select-none">مبلغ</span>
                        <span>{bill.price}</span>
                    </li>
                    <li className={LiStyle}>
                        <span className="select-none">تاریخ</span>
                        <span>{timestampToTime(bill.buy_date)}</span>
                    </li>
                </ul>
            </>
        )
    }

    return (
        <Modal isOpen={open} onClose={handleClose}>
            <div className={styles.box}>
                <div className={styles.list}>
                    <h1>رسید تراکنش</h1>
                    { data.for?.user && <Dropdown header='text-white' className='m-4' title='اطلاعات کاربر' component={<User user={data.for.user} />}/> }
                    { data.paymentID && <Dropdown header='text-white' className='m-4' title='اطلاعات پرداخت' component={<Payment payment={data.paymentID} />}/> }
                    { data.planID && <Dropdown header='text-white' className='m-4' component={<Plan plan={data.planID}/>} title='اطلاعات بسته'/> }
                    { data && <Dropdown header='text-white' className='m-4' title='اطلاعات تراکنش' component={<Bill/>}/> }
                </div>
            </div>
        </Modal>
    );
};

export default Receipt;