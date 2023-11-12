import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import axios from 'axios';
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
axios.defaults.baseURL = 'http://localhost:80';
// axios.defaults.baseURL = 'http://api.delta-dev.top';
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);