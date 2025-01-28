import React, { useEffect, useState } from 'react';
import Modal from '../../../public/components/Modal';
import { getPlans } from '../../services/plan.service';
import Plan from '../../plan-section/Plan';
import Invoice from '../../public/Invoice';
import { upgradeConfig } from '../../services/config.service';

const Upgrade = ({ setOpenUpgrade, openUpgrade, configID, setReload, reload }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [openInvoice, setOpenInvoice] = useState(false);

    const handleClose = () => setOpenUpgrade(false);
    const handleCloseInvoice = () => {
        setSelectedPlan(null)
        handleClose()
    };

    const getPlanList = async () => {
        const result = await getPlans()
        setPlans(result.plans)
    }

    const handleUpgradeConfig = async () => {
        setLoading(true)
        const result = await upgradeConfig({ configID, planID: selectedPlan._id })
        if (result) {
            setOpenInvoice(false)
            setLoading(false)
            setReload(!reload)
        }
        if (result?.gatewayURL) document.location.href = result.gatewayURL
    }

    useEffect(() => {
        getPlanList()
        selectedPlan && handleClose()
    }, [selectedPlan]);

    return (
        <>
            <Invoice plan={selectedPlan} open={selectedPlan} loading={loading} handleButton={handleUpgradeConfig} handleClose={handleCloseInvoice} />
            <Modal isOpen={openUpgrade} onClose={handleClose}>
                <div className='flex flex-wrap flex-col dir-rtl'>
                    <h1 className='mx-6 my-4 text-lg lg:text-xl font-semibold'>پلن مورد نظرتون رو انتخاب کنید👇</h1>
                    {
                        !selectedPlan &&
                            <div className=''>
                                {
                                    plans?.map(plan =>
                                        <Plan key={plan._id} plan={plan} upgrade={true} setSelectedPlan={setSelectedPlan} />
                                    )
                                }
                            </div>
                    }
                </div>
            </Modal>
        </>
    );
};

export default Upgrade;