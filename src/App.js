import { Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/auth/AuthForm';
import HomePage from './components/admin/home/HomePage';
import Plans from './components/admin/plan-section/Plans';
import Users from './components/admin/user-section/Users';
import NotFoundError from './components/admin/public/errors/NotFoundError';
import { ToastContainer } from 'react-toastify';
import Bills from './components/admin/bill-section/Bills';
import Tickets from './components/admin/support-section/Tickets';
import VerifyPayment from './components/admin/payment-section/VerifyPayment';
import Configs from './components/admin/config-section/Configs';
import 'react-loading-skeleton/dist/skeleton.css'

function App() {
  return (
    <div>
        <Routes>
          <Route path="/" element={<Navigate to="/sign-up"/>} />
          <Route path="/sign-up" element={<Auth />} />
          <Route path="/dashboard" element={<HomePage />}/>
          <Route path="/dashboard/plans" element={<Plans />}/>
          <Route path="/dashboard/users" element={<Users />}/>
          <Route path="/dashboard/bills" element={<Bills />}/>
          <Route path="/dashboard/support" element={<Tickets />}/>
          <Route path="/dashboard/configs" element={<Configs />}/>
          {/* <Route path="/dashboard/ticket/new" element={<NewTicket />}/> */}
          <Route path="/payment/:id" element={<VerifyPayment />}/>
          <Route path="/wallet/:id" element={<VerifyPayment wallet={true} />}/>
          {/* <Route path="/dashboard/ticket/:ticketID" element={<TicketDetails />}/> */}
          <Route path="/*" element={<NotFoundError />}/>
        </Routes>
        <ToastContainer />
    </div>
  );
}

export default App;
