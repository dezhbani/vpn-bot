import { Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/auth/AuthForm';
import HomePage from './components/admin/home/HomePage';
import Plans from './components/admin/plan-section/Plans';
import Users from './components/admin/user-section/Users';
import UserDetails from './components/admin/user-section/UserDetails';

function App() {

  // const [state, setState] = useState({id: "", phone:""});

  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-up"/>} />
        <Route path="/sign-up" element={<Auth />} />
        <Route path="/dashboard" element={<HomePage />}/>
        <Route path="/dashboard/plans" element={<Plans />}/>
        <Route path="/dashboard/users" element={<Users />}/>
        <Route path="/dashboard/users/:userID" element={<UserDetails />}/>
      </Routes>
    </div>
  );
}

export default App;
