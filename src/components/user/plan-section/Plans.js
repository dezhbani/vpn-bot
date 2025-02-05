import React, { useEffect, useState } from 'react';
import { getPlans } from '../services/plan.service';
import Sidebar from '../public/Sidebar';
import Plan from './Plan';
import Modal from '../../public/components/Modal';

const Plans = () => {
    const [plans, setPlans] = useState(null)

    const getPlanList = async () => {
        const result = await getPlans()
        setPlans(result.plans)
    }

    useEffect(() => {
        getPlanList()
    }, [])

    return (
        <>
            <Sidebar />
            {/* <Navbar /> */}
            <div className='flex z-20 dir-rtl w-[calc(100%-5rem)] sm:w-[calc(75%-3.5rem)] lg:w-[calc(80%-2rem)] xl:w-4/5 mt-28 max-md:justify-center flex-wrap'>
                {
                    plans?
                    plans?.map(plan => <Plan key={plan._id} plan={plan} />):
                    <Modal isOpen={true} loading={true} />
                }
            </div>
        </>
    );
};

export default Plans;