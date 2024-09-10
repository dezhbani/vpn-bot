import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '../../public/function';
import { verifyTransaction, verifyWalletTransaction } from '../services/payment.service';
import styles from './VerifyPayment.module.css';
import Loading from '../public/Loading';

const VerifyPayment = ({wallet = false}) => {
    const [ transaction , setTransaction ] = useState({})
    const query = useQuery();
    const { billID, configID } = useParams();
    const authority = query.get('Authority');
    const verify = async () => setTransaction(await verifyTransaction(billID, configID, authority));
    console.log(transaction);
    const verifyWallet = async () => {
        setTransaction(await verifyWalletTransaction(billID, authority))
    };
    useEffect(() => {
        wallet? verifyWallet() : verify()
    }, [])
    if(!transaction) return <div className={styles.mainContainer}><Loading /></div>
    return (
        <div className={`${styles.mainContainer}`}>
            <main className="relative flex justify-center flex-col py-4 sm:py-10 lg:py-12">
                <div className='flex w-full items-center justify-center'>
                    <div className={` p-7 transition-all lg:p-9  ${styles.container}`}>
                        <div className="flex flex-col items-center justify-center">
                            {
                                transaction?.code == 100 || transaction?.code == 101 ?
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-28 text-green-500 lg:w-36"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"></path></svg>
                                :<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-28 text-red-500 lg:w-36"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            }
                            <h2 className="mt-7 select-none text-center text-base font-bold lg:mt-9 lg:text-2xl">{transaction?.message}</h2>
                            {
                                transaction.status ? '':  <ul className="mt-7 flex w-full flex-col lg:mt-9">
                                <li className="flex items-center justify-between gap-4 border-b-2 border-solid border-gray-300  py-2 text-sm transition-all last:border-none lg:text-base">
                                    <span className="select-none">شماره پیگیری</span>
                                    <span>{transaction?.bill?.paymentID?.invoiceNumber}</span>
                                </li>
                                <li className="flex items-center justify-between gap-4 border-b-2 border-solid border-gray-300 py-2 text-sm transition-all last:border-none lg:text-base">
                                    <span className="select-none">مبلغ</span>
                                    <span>{transaction?.bill?.paymentID?.amount}</span>
                                </li>
                                <li className="flex items-center justify-between gap-4 border-b-2 border-solid border-gray-300 py-2 text-sm transition-all last:border-none lg:text-base">
                                        <span className="select-none">نوع پرداخت</span>
                                        <span>درگاه بانکی</span>
                                </li>
                            </ul>
                            }
                            <Link to={'/dashboard'} replace={true} className="mt-7 lg:mt-9">
                                <button className={`relative bg-gradient-to-r from-blue-400 to-sky-400 select-none flex justify-center items-center transition-all rounded-lg px-5 md:px-7 py-3 md:py-4 gap-4 text-base lg:text-xl hover:ring-4  ring-cnBlue-15/30 opacity-100 cursor-pointer from-cnBlue-20 to-cnBlue-15 text-white`}>
                                    <span className="transition-allvisible opacity-100">بازگشت به حساب کاربری</span>
                                    
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            < div  className={styles.gContainer} > 
                < div  className={styles.gInner} > </ div > 
            </ div >
            </main>
        </div>
    );
};

export default VerifyPayment;
            // <div className={styles.}>
            //     <div className={styles.logoContainer}>
            //         <img className={styles.logo} src={delta}/>
            //     </div>
            //     {
            //         transaction? 
            //             <div>
            //                 <div className={styles.box}>
            //                     <div className={styles.amountContainer}>
            //                         <div className={styles.amount}>{addCommaToPrice(transaction?.bill?.price)} <span> تومان </span> </div>
            //                         <div className={styles.resultTransaction}>{transaction.message}</div>
            //                     </div>
            //                     <div className={styles.buttonContainer}>
            //                         <Link to={'/dashboard'} replace={true}>
            //                             <button className={styles.button}>بازگشت به پنل</button>
            //                         </Link>
            //                     </div>
            //                 </div>
            //             </div>
            //         : <div className={styles.loading}><Loading /></div>                
            //     }
            // </div>