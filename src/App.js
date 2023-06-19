import { Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Auth from './components/auth/AuthForm';
import Timer from './components/public/Timer';
// import Auth from './components/auth/auth';

function App() {

  // const [state, setState] = useState({id: "", phone:""});

  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-up"/>} />
        <Route path="/sign-up" element={<Auth />} />
        <Route path="/sign" element={<Timer />} />
      </Routes>
    </div>
  );
}

export default App;
