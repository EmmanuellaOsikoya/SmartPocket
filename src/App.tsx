import React from 'react';
import Register from './Register';
import Home from './Home';
import Login from './Login';
import ExpenseCategorisation from './ExpenseCategorisation';
import { Routes, Route } from 'react-router-dom';
import TransactionHistory from './TrsnsactionHistory';

function App() {
  return (
    <Routes>
      <Route path ="/" element={<Register />} />
      <Route path ="/home" element={<Home />} />
      <Route path ="/login" element={<Login />} />
      <Route path="/expense-categorisation" element={<ExpenseCategorisation />} />
      <Route path ="/history" element={<TransactionHistory />} />
    </Routes>
  );
}

export default App;
