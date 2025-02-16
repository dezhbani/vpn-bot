import React, { useEffect, useState } from 'react';
import Sidebar from '../public/Sidebar';
import Modal from '../../public/components/Modal';
import ReactPaginate from 'react-paginate';
import { getAllBills } from '../services/bill.service';
import { Link } from 'react-router-dom';
import Bill from '../config-section/modules/Bill';

const Bills = () => {
    const [bills, setBills] = useState([]); // لیست بیل‌ها
    const [loading, setLoading] = useState(true); // حالت loading
    const [error, setError] = useState(null); // حالت error
    const [currentPage, setCurrentPage] = useState(1); // صفحه فعلی
    const [totalPages, setTotalPages] = useState(0); // تعداد صفحات کلی

    // فراخوانی API برای دریافت بیل‌ها
    const fetchBills = async (page = 1) => {
        try {
            setLoading(true);
            const result = await getAllBills({ page, limit: 50 }); // فرض کنید getAllBills(page) API را برای pagination پشتیبانی می‌کند
            if (result) {
                setBills(result.bills || []); // تنظیم لیست بیل‌ها
                setTotalPages(result.totalPages || 1); // تنظیم تعداد صفحات کلی
            }
        } catch (err) {
            console.error('Error fetching bills:', err);
            setError('Failed to load bills');
        } finally {
            setLoading(false);
        }
    };

    // درخواست اولیه برای صفحه اول
    useEffect(() => {
        fetchBills();
        console.log(currentPage);
    }, []);

    // تغییر صفحه
    const handlePageClick = (data) => {

        const selectedPage = data.selected + 1; // صفحه‌ها از 1 شروع می‌شوند
        setCurrentPage(selectedPage);
        fetchBills(selectedPage);
    };

    return (
        <>
            <Sidebar />
            <div className={`flex ${!bills.length && "h-[78%]"} z-20 dir-ltr w-[calc(100%-7rem)] sm:w-[calc(75%-3.5rem)] lg:w-[calc(80%-2rem)] xl:w-4/5 ml-4 mr-6 mt-28 mb-4 lg:mt-32 rounded-xl flex-wrap font-iran-sans`}>
                {/* Loading Modal */}
                <Modal isOpen={loading} loading={loading} />

                {/* Error Message */}
                {error && (
                    <div className="text-red-500 text-center font-medium mb-4">
                        {error}
                    </div>
                )}
                <div className='w-full max-w-full dir-rtl h-fit bg-white shadow-[2px_4px_30px_0px_#00000010] mt-4 rounded-xl p-3'>

                    {totalPages > 1 && (
                        <ReactPaginate
                            previousLabel={
                                <svg
                                    className="w-5 h-5 text-gray-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            }
                            nextLabel={
                                <svg
                                    className="w-5 h-5 text-gray-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            }
                            breakLabel="..."
                            pageCount={totalPages}
                            marginPagesDisplayed={0.5}
                            pageRangeDisplayed={0}
                            onPageChange={handlePageClick}
                            containerClassName="flex flex-wrap dir-ltr items-center justify-center space-x-2 sm:space-x-3"
                            activeClassName="bg-[#0095ff] text-white bg-main-blue rounded-full px-2 sm:px-3 py-1 sm:py-1.5"
                            pageClassName="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-2 sm:px-3 py-1 sm:py-1.5"
                            previousClassName="cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-full p-1 sm:p-2"
                            nextClassName="cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-full p-1 sm:p-2"
                            disabledClassName="opacity-50 cursor-not-allowed px-2 sm:px-3 py-1 sm:py-1.5"
                            forcePage={currentPage - 1}
                        />
                    )}
                </div>

                {/* No Bills Available */}
                {!loading && bills.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 rounded-lg shadow-sm p-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-12 h-12 text-gray-400"
                            fill="currentColor"
                        >
                            <path d="M2.978 8.358l-2.978-2.618 8.707-4.74 3.341 2.345 3.21-2.345 8.742 4.639-3.014 2.68.014.008 3 4.115-3 1.634v4.122l-9 4.802-9-4.802v-4.115l1 .544v2.971l7.501 4.002v-7.889l-2.501 3.634-9-4.893 2.978-4.094zm9.523 5.366v7.875l7.499-4.001v-2.977l-5 2.724-2.499-3.621zm-11.022-1.606l7.208 3.918 1.847-2.684-7.231-3.742-1.824 2.508zm11.989 1.247l1.844 2.671 7.208-3.927-1.822-2.498-7.23 3.754zm-9.477-4.525l8.01-4.43 7.999 4.437-7.971 4.153-8.038-4.16zm-2.256-2.906l2.106 1.851 7.16-3.953-2.361-1.657-6.905 3.759zm11.273-2.052l7.076 3.901 2.176-1.935-6.918-3.671-2.334 1.705z" />
                        </svg>
                        <span className="block mt-2 text-gray-500 text-sm">هنوز هیچ بیلی ثبت نشده است!</span>
                        <button className="mt-4 px-4 py-2 bg-[#0095ff] text-white rounded-md shadow-sm hover:bg-[#0077c2] transition duration-300">
                            <Link to="/plans" className="text-white">
                                مشاهده پلن‌ها
                            </Link>
                        </button>
                    </div>
                )}

                {/* Bills List */}
                {
                    !loading && bills.length > 0 &&
                    <div className='w-full overflow-x-auto dir-rtl h-auto bg-white shadow-[2px_4px_30px_0px_#00000010] mt-4 rounded-xl p-3'>
                        {
                            bills.map(bill => <div className='border-b-2 border-gray-100'>
                                <Bill bill={bill} key={bill._id} />
                            </div>)
                        }
                    </div>
                }

                {/* Pagination Component */}
            </div>
        </>
    );
};

export default Bills;