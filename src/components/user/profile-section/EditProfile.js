import React, { useContext, useEffect, useRef, useState } from 'react';
import { ProfileContext } from '../../context/UserProfileContext';
import EditIcon from '../assets/Edit.svg';
import { changeMobile, checkOTP, editProfile } from '../services/profile.service';
import { handleMessage } from '../../public/function';
import { toast } from 'react-toastify';
import Modal from '../../public/components/Modal';

const EditProfile = () => {
    const [data, setData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [editMobile, setEditMobile] = useState(false);
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState([]);
    const inputRefs = useRef([]);
    const user = useContext(ProfileContext);

    const handleKeyPress = index => e => {
        let nextIndex = null
        if (!isNaN(+e.key)) {
            if (!isNaN(+e.key) && index + 1 < 6) nextIndex = index + 1
            if (nextIndex < 5 && nextIndex >= 0) inputRefs.current[nextIndex].focus();
        }
    };

    const changeOTP = event => {
        if (!isNaN(+event.target.value)) {
            const arr = [...code]
            arr[+event.target.name - 1] = event.target.value
            setCode(arr)
        }
    }

    const change = event => {
        setData(prevData => ({ ...prevData, [event.target.name]: event.target.value }));
    }

    const cancelEdit = () => {
        setEditMode(false);
        setData(user);
    }
    const cancelEditMobile = () => {
        setEditMobile(false);
        setData({ ...data, mobile: user.mobile });
    }

    const confirmEdit = async () => {
        setLoading(true)
        if (data.mobile !== user.mobile) {
            setEditMobile(true)
            const changeResult = await changeMobile({ mobile: data.mobile })
            if (!changeResult) {
                setEditMobile(false)
            }
        }
        const editResult = await editProfile(data)
        if ((data.mobile == user.mobile) && editResult) {
            setTimeout(() => toast.info('...تازه سازی صفحه', 3000), 2000)
            setTimeout(() => document.location.reload(), 4000)
        }
        setEditMode(false);
        setLoading(false)
    }
    const confirmEditMobile = async () => {
        if (code.length == 0) toast.error('کد تایید را وارد کنید')
        else if (data.mobile !== user.mobile) {
            setLoading(true)
            const mergedCode = code.join('')
            const result = await checkOTP({ mobile: data.mobile, code: mergedCode })
            handleMessage(result)
            localStorage.setItem('accessToken', result.accessToken)
            setCode([])
            setEditMode(false);
            setEditMobile(false);
            setLoading(false)
        }
    }

    const openEditMode = () => {
        setEditMode(!editMode)
        setEditMobile(false)
    }

    useEffect(() => {
        setEditMode(false);
        setData(user);
    }, [user]);

    return (
        <>
            <Modal isOpen={loading} loading={loading} />
            <div className="w-full p-6 bg-white rounded-lg">
                <div className="text-xl flex items-center h-fit font-bold w-full justify-between">
                    <h1>
                        <span className='mx-2 inline-block bg-main-blue rounded-full w-2.5 h-2.5' />
                        اطلاعات کاربر
                    </h1>
                    <div onClick={openEditMode} className='flex font-medium'>
                        <img className='mx-3 h-8 cursor-pointer transition duration-200 ease-in-out transform hover:scale-110' src={EditIcon} alt='EditIcon' />
                        <span className={`${!editMode && 'hidden'} transition-opacity duration-300`}>ویرایش</span>
                    </div>
                </div>
                <div className='flex text-xl justify-center'>
                    <div className='flex flex-col items-center'>
                        <div className='flex flex-col m-10'>
                            <label className='text-xs text-gray-500'>نام و نام خانوادگی فارسی</label>
                            <input className={`${editMode ? 'border-b-2 border-main-blue focus:border-red-500 transform transition duration-500' : 'opacity-50'} outline-none py-1 mt-1 px-2 dir-rtl`} value={data.full_name || ''} name='full_name' onChange={change} readOnly={!editMode} />
                        </div>
                        {
                            editMobile ?
                                <div className='flex flex-col justify-center w-fit mt-5'>
                                    <span className='rtl text-lg font-medium'>کد تایید:</span>
                                    <div className='flex dir-ltr'>
                                        {
                                            [1, 2, 3, 4, 5].map((num, index) => <input key={index} onKeyUp={handleKeyPress(index)} ref={(ref) =>
                                                (inputRefs.current[index] = ref)}
                                                className="w-8 h-8 flex justify-center rounded text-center my-1 mx-2 text-md border-[2px] border-solid transition-all delay-200 ease-in focus:border-blue-500 outline-none"
                                                minLength="1"
                                                maxLength="1"
                                                onChange={changeOTP}
                                                name={num}
                                                value={code[num - 1]}
                                                type="tel"
                                            />)
                                        }
                                    </div>
                                    <div className='flex'>
                                        <button className='w-max text-sm bg-main-blue text-white px-6 py-1 m-5 rounded-lg' onClick={confirmEditMobile}>تایید</button>
                                        <button className='w-max text-sm bg-gray-200 px-6 py-1 m-5 rounded-lg' onClick={cancelEditMobile}>انصراف</button>
                                    </div>
                                </div>
                                : <div className='flex flex-col m-10'>
                                    <label className='text-xs text-gray-500'>موبایل</label>
                                    <input className={`${editMode ? 'border-b-2 border-main-blue focus:border-red-500 transform transition duration-500' : 'opacity-50'} outline-none py-1 mt-1 px-2 dir-ltr`} value={data.mobile || ''} name='mobile' onChange={change} readOnly={!editMode} />
                                </div>
                        }
                    </div>
                    <div className='flex flex-col'>
                        <div className='flex flex-col m-10'>
                            <label className='text-xs text-gray-500'>نام لاتین</label>
                            <input className={`${editMode ? 'border-b-2 border-main-blue focus:border-red-500 transform transition duration-500' : 'opacity-50'} outline-none py-1 mt-1 px-2 dir-ltr`} value={data.first_name || ''} name='first_name' onChange={change} readOnly={!editMode} />
                        </div>
                        <div className='flex flex-col m-10'>
                            <label className='text-xs text-gray-500'>نام خانوادگی لاتین</label>
                            <input className={`${editMode ? 'border-b-2 border-main-blue focus:border-red-500 transform transition duration-500' : 'opacity-50'} outline-none py-1 mt-1 px-2 dir-ltr`} value={data.last_name || ''} name='last_name' onChange={change} readOnly={!editMode} />
                        </div>
                    </div>
                </div>
                {
                    editMode &&
                    <div className='w-full flex justify-center mt-5 text-xl'>
                        <button className='w-36 bg-gray-200 px-6 py-1 mx-5 rounded-lg' onClick={cancelEdit}>انصراف</button>
                        <button className='w-36 bg-main-blue text-white px-6 py-1 mx-5 rounded-lg' onClick={confirmEdit}>ثبت</button>
                    </div>
                }
            </div>
        </>
    );
};

export default EditProfile;
