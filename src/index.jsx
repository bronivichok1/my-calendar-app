import React from 'react';
import ReactDOM from 'react-dom/client';
import {  BrowserRouter, Routes, Route} from 'react-router-dom';
import './index.css';
import App from './App'; 
import RoomsList from './RoomsList'
import Auth from './Auth'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<App />}/>
    <Route path="/rooms" element={<RoomsList />}/>
    <Route path="/auth" element={<Auth />}/>
    </Routes>
    </BrowserRouter>
);
