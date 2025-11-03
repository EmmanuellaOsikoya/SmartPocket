import React from 'react';
import logo from './logo.svg';
import Register from './Register';
import Home from './Home';
import Login from './Login';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path ="/" element={<Register />} />
      <Route path ="/home" element={<Home />} />
      <Route path ="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
