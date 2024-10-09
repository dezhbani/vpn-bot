import { Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/auth/AuthForm';
import NotFoundError from './components/admin/public/errors/NotFoundError';
import { ToastContainer } from 'react-toastify';
import 'react-loading-skeleton/dist/skeleton.css'
import Profile from './components/user/profile-section/Profile';
import AllRoutes from './router/AllRoutes';
import { useContext } from 'react';
import VerifyPayment from './components/admin/payment-section/VerifyPayment';
import Modal from './components/public/components/Modal';

function App() {
  
  
  
  return (
    <div className=''> 
        <Routes>
          <Route path="/" element={<Navigate to="/sign-up"/>} />
          <Route path="/sign-up" element={<Auth />} />
          <Route path="/payment/:billID/:configID" element={<VerifyPayment />}/>
            <Route path="/wallet/:id" element={<VerifyPayment wallet={true} />}/>
          {/* <Route path="/dashboard/ticket/new" element={<NewTicket />}/> */}
          {/* <Route path="/dashboard/ticket/:ticketID" element={<TicketDetails />}/> */}
          {
            AllRoutes()
          }
          <Route path="/*" element={<NotFoundError />}/>
        </Routes>
        <ToastContainer />
    </div>
  );
}

export default App;
