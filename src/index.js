import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import axios from 'axios';

const root = ReactDOM.createRoot(document.getElementById('root'));
axios.defaults.baseURL = 'http://s1.delta-dev.top';
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
