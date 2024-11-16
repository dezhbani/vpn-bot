import { Route } from 'react-router-dom';
import Invoice from '../components/public/payment/components/Invoice';

const PaymentRoutes = () => {
    // document.body.style.backgroundColor = '#CFD9E8'
    
    return (
        <>
            <Route path="/wallet/:billID" element={<Invoice />}/>
        </>
    );
};

export default PaymentRoutes;