import { Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/auth/AuthForm';
import HomePage from './components/admin/home/HomePage';
import Plan from './components/admin/plan-section/Plans';

function App() {

  // const [state, setState] = useState({id: "", phone:""});

  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-up"/>} />
        <Route path="/sign-up" element={<Auth />} />
        <Route path="/dashboard" element={<HomePage />}/>
        <Route path="/dashboard/plans" element={<Plan />}/>
      </Routes>
    </div>
  );
}

export default App;
