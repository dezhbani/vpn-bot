import { Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/auth/AuthForm';
import NotFoundError from './components/admin/public/errors/NotFoundError';
import { ToastContainer } from 'react-toastify';
import 'react-loading-skeleton/dist/skeleton.css'
import PaymentRoutes from './router/PaymentRoutes';
import UserRoutes from './router/UserRoutes';
import AdminRoutes from './router/AdminRoutes';
import PrivateRoute from './router/PrivateRoute';
import CompleteProfile from './components/auth/CompleteProfile';
function App() {

  document.body.style.backgroundColor = '#f9f9f9'


  return (
    <div className=''>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/sign-up" />} />
        <Route path="/sign-up" element={<Auth />} />

        {/* Protected Routes for User Panel */}
        <Route element={<PrivateRoute allowedRoles={['customer']} />}>
          <Route path="*" element={<UserRoutes />} />
        </Route>

        {/* Protected Routes for Admin Panel */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'owner']} />}>
          <Route path="/dashboard/*" element={<AdminRoutes />} />
        </Route>
        <Route path='/complete-signup' element={<CompleteProfile/>} />
        {/* Payment Routes */}
        <Route path="/payment/*" element={<PaymentRoutes />} />

        {/* Not Found */}
        <Route path="*" element={<NotFoundError />} />
      </Routes>
      <ToastContainer className='dir-rtl' />
    </div>
  );
}

export default App;
