import React from 'react';
import ReactDOM from 'react-dom/client';
import {  BrowserRouter, Routes, Route} from 'react-router-dom';
import './index.css';
import App from './App'; 
import RoomsList from './RoomsList'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<App />}/>
    <Route path="/rooms" element={<RoomsList />}/>
    </Routes>
    </BrowserRouter>
);
