import React, { useEffect, useState } from 'react';
import { getPlans } from '../services/plan.service';
import Sidebar from '../public/Sidebar';
import Plan from './Plan';

const Plans = () => {
    const [plans, setPlans] = useState([])

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
            <div className='flex z-20 dir-rtl w-[calc(100%-7rem)] sm:w-[calc(75%-3.5rem)] lg:w-[calc(80%-2rem)] xl:w-4/5 mt-28 flex-wrap'>
                {
                    plans?.map(plan => <Plan key={plan._id} plan={plan} />)
                }
            </div>
        </>
    );
};

export default Plans;