import React, { useEffect, useState } from 'react';
import { getPlans } from '../services/plan.service';
import Sidebar from '../public/Sidebar';
import Navbar from '../public/Navbar';
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
            <Navbar />
            <div className='flex z-20 dir-rtl w-4/5 mt-28 flex-wrap'>
                {
                    plans?.map(plan => <Plan key={plan._id} plan={plan} />)
                }
            </div>
        </>
    );
};

export default Plans;