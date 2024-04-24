import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import axios from 'axios';
import './index.css'
import UserProfileContext from './components/context/UserProfileContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
axios.defaults.baseURL = 'http://localhost:8000';
// axios.defaults.baseURL = 'http://s2.delta-dev.top:8000';
root.render(
  <UserProfileContext>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </UserProfileContext>
);
