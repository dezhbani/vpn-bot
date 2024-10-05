import HomePage from '../components/admin/home/HomePage';
import Plans from '../components/admin/plan-section/Plans';
import Users from '../components/admin/user-section/Users';
import Bills from '../components/admin/bill-section/Bills';
import Tickets from '../components/admin/support-section/Tickets';
import Configs from '../components/admin/config-section/Configs';
import { Route } from 'react-router-dom';

const AdminRoutes = () => {
    
  document.body.style.backgroundColor = '#fff'

    return (
        <>
            <Route path="/dashboard" element={<HomePage />}/>
            <Route path="/dashboard/plans" element={<Plans />}/>
            <Route path="/dashboard/users" element={<Users />}/>
            <Route path="/dashboard/bills" element={<Bills />}/>
            <Route path="/dashboard/support" element={<Tickets />}/>
            <Route path="/dashboard/configs" element={<Configs />}/>
        </>
    );
};

export default AdminRoutes;