import React, { useState } from 'react';
import SettingIcon from '../../assets/SettingBlue.svg';
import Invoice from '../../public/Invoice';
import { changeConfigStatus, repurchaseConfig } from '../../services/config.service';
import { Link } from 'react-router-dom';
import Modal from '../../../public/components/Modal';


const Options = ({ plan, configID, config, setReload, reload }) => {
    // const [openSetting, setOpenSetting] = useState(false)

    const [openInvoice, setOpenInvoice] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isChecked, setIsChecked] = useState(!config?.enable);
    const handleClose = () => setOpenInvoice(false)
    const handleOpen = () => setOpenInvoice(true)
    const handleRepurchaseConfig = async () => {
        setLoading(true)
        const result = await repurchaseConfig({ configID })
        if (result) {
            setOpenInvoice(false)
            setLoading(false)
            setReload(!reload)
        }
        if (result?.gatewayURL) document.location.href = result.gatewayURL
    }
    const changeStatus = async () => {
        setLoading(true)
        const result = await changeConfigStatus({ configID })
        setLoading(false)
        setIsChecked(!result.configStatus)
    }
    return (
        <>
            <Modal isOpen={loading} loading={loading} />
            <Invoice plan={plan} open={openInvoice} loading={loading} handleButton={handleRepurchaseConfig} handleClose={handleClose} repurchase={true} />
            <div className='w-full flex justify-between'>
                <div className='flex'>
                    {/* <img className='bg-main-blue/10 p-2 rounded-xl h-9 w-9 mx-2' src={EditIcon} alt='EditIcon' /> */}
                    <img className='bg-main-blue/10 p-2 rounded-xl h-9 w-9 mx-2' src={SettingIcon} alt='SettingIcon' />
                    {/* <label class="inline-flex items-center relative">
                        <input class="peer hidden" id="toggle" type="checkbox" checked={isChecked} onChange={changeStatus} />
                        <div
                            class="relative w-20 h-9 bg-main-blue peer-checked:bg-main-blue/10 rounded-full after:absolute after:content-[''] after:w-7 after:h-7 after:bg-white peer-checked:after:from-zinc-900 peer-checked:after:to-zinc-900 after:rounded-full after:top-[5px] after:left-[5px] active:after:w-9 peer-checked:after:left-[76px] peer-checked:after:translate-x-[-100%] shadow-sm duration-300 after:duration-300 after:shadow-md"
                        ></div>
                        <svg className='fill-black opacity-60 peer-checked:opacity-70 peer-checked:fill-white peer-checked:hidden absolute w-6 h-6 right-2' xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                            <path d="M17.5 29.5312C18.7081 29.5312 19.6875 28.5519 19.6875 27.3438C19.6875 26.1356 18.7081 25.1562 17.5 25.1562C16.2919 25.1562 15.3125 26.1356 15.3125 27.3438C15.3125 28.5519 16.2919 29.5312 17.5 29.5312Z" fill="#fff" />
                            <path d="M32.8125 3.73406L31.2659 2.1875L2.1875 31.2659L3.73406 32.8125L15.4175 21.1291C16.5405 20.7461 17.747 20.6782 18.9059 20.9327C20.0648 21.1872 21.1318 21.7545 21.9909 22.5728L23.5375 21.0263C22.0206 19.5734 20.03 18.7173 17.932 18.6156L21.6377 14.91C23.5077 15.5303 25.2139 16.564 26.6295 17.9342L28.175 16.3877C26.7784 15.0306 25.1352 13.9528 23.3341 13.2125L26.612 9.93453C28.3195 10.8214 29.8872 11.9546 31.2648 13.2978L32.8125 11.7502V11.748C31.4417 10.4083 29.9009 9.25433 28.2297 8.31578L32.8125 3.73406ZM16.0563 14.3041L18.2897 12.0706C18.025 12.0564 17.7658 12.0312 17.5 12.0312C13.503 12.0305 9.66546 13.5987 6.81297 16.3986L8.35953 17.9441C10.4479 15.9071 13.1568 14.626 16.0563 14.3041ZM17.5 7.65625C19.0603 7.66221 20.6143 7.85499 22.1287 8.23047L23.9258 6.43453C20.1603 5.27542 16.1512 5.15724 12.324 6.09253C8.4967 7.02783 4.99401 8.98171 2.1875 11.7469V11.772L3.72313 13.3077C7.39313 9.6848 12.3431 7.65429 17.5 7.65625Z" fill="#fff" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" class="fill-white peer-checked:opacity-60 absolute hidden peer-checked:flex w-6 h-6 left-2" width="36" height="29" viewBox="0 0 36 29" fill="none">
                            <path d="M17.9494 19.7494C15.9609 19.7494 14.3494 21.3615 14.3494 23.3499C14.3494 25.3384 15.9615 26.9505 17.9494 26.9505C19.9373 26.9505 21.5494 25.3384 21.5494 23.3499C21.5494 21.3615 19.9856 19.7494 17.9494 19.7494ZM18 10.7494C14.0484 10.7494 10.2431 12.1894 7.28438 14.8011C6.54188 15.5081 6.46876 16.6444 7.12688 17.3925C7.79063 18.135 8.92688 18.2081 9.66938 17.55C11.97 15.5194 14.9288 14.4 18 14.4C21.0713 14.4 24.0356 15.5183 26.3306 17.55C26.6738 17.8538 27.1013 18 27.5231 18C27.7784 18.0002 28.0308 17.9461 28.2636 17.8413C28.4963 17.7364 28.7041 17.5833 28.8731 17.3919C29.5313 16.6444 29.4638 15.5081 28.7156 14.85C25.7569 12.24 21.9544 10.7494 18 10.7494ZM35.4488 8.81438C30.7294 4.29075 24.5363 1.8 18 1.8C11.4638 1.8 5.27007 4.29075 0.553732 8.81438C-0.163456 9.50344 -0.186518 10.6425 0.500969 11.3597C1.18834 12.0786 2.32741 12.0977 3.04628 11.4125C7.03688 7.48688 12.3975 5.4 18 5.4C23.6025 5.4 28.8619 7.53582 32.9513 11.4131C33.3056 11.745 33.75 11.9138 34.2 11.9138C34.6728 11.9138 35.1456 11.7292 35.4988 11.36C36.1856 10.6425 36.1631 9.45563 35.4488 8.81438Z" fill="#0095ff" />
                        </svg>
                    </label> */}
                    <label class="inline-flex items-center relative">
                        <input
                            class="peer hidden"
                            id="toggle"
                            type="checkbox"
                            checked={isChecked}
                            onChange={changeStatus}
                        />
                        <div
                            class="relative w-16 h-7 sm:w-20 sm:h-9 bg-main-blue peer-checked:bg-main-blue/10 rounded-full after:absolute after:content-[''] after:w-5 after:h-5 sm:after:w-7 sm:after:h-7 after:bg-white peer-checked:after:bg-zinc-900 after:rounded-full after:top-[4px] sm:after:top-[5px] after:left-[4px] sm:after:left-[5px] peer-checked:after:left-[calc(100%-28px)] sm:peer-checked:after:left-[calc(100%-34px)] shadow-sm duration-300 after:duration-300 after:shadow-md"
                        ></div>
                        <svg
                            class="fill-black opacity-60 peer-checked:opacity-70 peer-checked:fill-white peer-checked:hidden absolute w-5 h-5 sm:w-6 sm:h-6 right-2"
                            xmlns="http://www.w3.org/2000/svg"
                            width="36"
                            height="36"
                            viewBox="0 0 36 36"
                            fill="none"
                        >
                            <path
                                d="M17.5 29.5312C18.7081 29.5312 19.6875 28.5519 19.6875 27.3438C19.6875 26.1356 18.7081 25.1562 17.5 25.1562C16.2919 25.1562 15.3125 26.1356 15.3125 27.3438C15.3125 28.5519 16.2919 29.5312 17.5 29.5312Z"
                                fill="#fff"
                            />
                            <path
                                d="M32.8125 3.73406L31.2659 2.1875L2.1875 31.2659L3.73406 32.8125L15.4175 21.1291C16.5405 20.7461 17.747 20.6782 18.9059 20.9327C20.0648 21.1872 21.1318 21.7545 21.9909 22.5728L23.5375 21.0263C22.0206 19.5734 20.03 18.7173 17.932 18.6156L21.6377 14.91C23.5077 15.5303 25.2139 16.564 26.6295 17.9342L28.175 16.3877C26.7784 15.0306 25.1352 13.9528 23.3341 13.2125L26.612 9.93453C28.3195 10.8214 29.8872 11.9546 31.2648 13.2978L32.8125 11.7502V11.748C31.4417 10.4083 29.9009 9.25433 28.2297 8.31578L32.8125 3.73406ZM16.0563 14.3041L18.2897 12.0706C18.025 12.0564 17.7658 12.0312 17.5 12.0312C13.503 12.0305 9.66546 13.5987 6.81297 16.3986L8.35953 17.9441C10.4479 15.9071 13.1568 14.626 16.0563 14.3041ZM17.5 7.65625C19.0603 7.66221 20.6143 7.85499 22.1287 8.23047L23.9258 6.43453C20.1603 5.27542 16.1512 5.15724 12.324 6.09253C8.4967 7.02783 4.99401 8.98171 2.1875 11.7469V11.772L3.72313 13.3077C7.39313 9.6848 12.3431 7.65429 17.5 7.65625Z"
                                fill="#fff"
                            />
                        </svg>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="fill-white peer-checked:opacity-60 absolute hidden peer-checked:flex w-5 h-5 sm:w-6 sm:h-6 left-2"
                            width="36"
                            height="29"
                            viewBox="0 0 36 29"
                            fill="none"
                        >
                            <path
                                d="M17.9494 19.7494C15.9609 19.7494 14.3494 21.3615 14.3494 23.3499C14.3494 25.3384 15.9615 26.9505 17.9494 26.9505C19.9373 26.9505 21.5494 25.3384 21.5494 23.3499C21.5494 21.3615 19.9856 19.7494 17.9494 19.7494ZM18 10.7494C14.0484 10.7494 10.2431 12.1894 7.28438 14.8011C6.54188 15.5081 6.46876 16.6444 7.12688 17.3925C7.79063 18.135 8.92688 18.2081 9.66938 17.55C11.97 15.5194 14.9288 14.4 18 14.4C21.0713 14.4 24.0356 15.5183 26.3306 17.55C26.6738 17.8538 27.1013 18 27.5231 18C27.7784 18.0002 28.0308 17.9461 28.2636 17.8413C28.4963 17.7364 28.7041 17.5833 28.8731 17.3919C29.5313 16.6444 29.4638 15.5081 28.7156 14.85C25.7569 12.24 21.9544 10.7494 18 10.7494ZM35.4488 8.81438C30.7294 4.29075 24.5363 1.8 18 1.8C11.4638 1.8 5.27007 4.29075 0.553732 8.81438C-0.163456 9.50344 -0.186518 10.6425 0.500969 11.3597C1.18834 12.0786 2.32741 12.0977 3.04628 11.4125C7.03688 7.48688 12.3975 5.4 18 5.4C23.6025 5.4 28.8619 7.53582 32.9513 11.4131C33.3056 11.745 33.75 11.9138 34.2 11.9138C34.6728 11.9138 35.1456 11.7292 35.4988 11.36C36.1856 10.6425 36.1631 9.45563 35.4488 8.81438Z"
                                fill="#0095ff"
                            />
                        </svg>
                    </label>
                </div>
                <div className='flex items-center'>
                    {/* <p className="flex w-fit items-center justify-center text-base text-main-blue bg-main-blue/10 px-4 py-2 mx-3 rounded-md">ارتقا کانفیگ</p>
                    <p className="flex w-fit items-center justify-center text-base text-white bg-main-blue px-4 py-2 mx-3 rounded-md" onClick={handleOpen}>تمدید کانفیگ</p> */}
                    <p className="flex w-fit items-center justify-center text-base max-sm:hidden text-main-blue bg-main-blue/10 px-4 py-2 mx-3 rounded-md">ارتقا کانفیگ</p>
                    <p className="flex w-fit items-center justify-center text-base text-white bg-main-blue px-2 py-1 mx-1 sm:px-4 sm:py-2 sm:mx-3 rounded-md" onClick={handleOpen}>تمدید کانفیگ</p>
                </div>
            </div>
        </>
    );
};

export default Options;