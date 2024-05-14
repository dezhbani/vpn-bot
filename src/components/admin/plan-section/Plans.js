import React, { useEffect, useState } from 'react';
import { getPlans } from '../../services/plan.service';
import Plan from './Plan';
import Sidebar from '../public/Sidebar';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    useEffect(() => {
        const allPlans = async () => {
            const allPlans = await getPlans()
            setPlans(allPlans)
        }
        allPlans()
        document.title = 'dashboard';
    }, [])
    return (
        <>
            <Sidebar />
            <div>
                <div className="flex w-[calc(100%-72px)] sm:w-3/4 lg:w-5/6 xl:w-[85%] justify-center flex-wrap">
                    <div className='flex justify-start dir-rtl flex-wrap max-md:justify-center w-full'>
                        {
                            plans?.map(plan => <Plan key={plan._id} data={plan}/>)
                        }
                    </div>
                </div>
            </div>
        </>
    );
};

export default Plans;