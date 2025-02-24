import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import axios from 'axios';
import './index.css'
import UserProfileContext from './components/context/UserProfileContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
// axios.defaults.baseURL = 'https://api.delta-dev.top';
axios.defaults.baseURL = 'http://localhost';
root.render(
  <UserProfileContext>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </UserProfileContext>
);
