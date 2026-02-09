import React from 'react';
import Register from './Register';
import Home from './Home';
import Login from './Login';
import ExpenseCategorisation from './ExpenseCategorisation';
import { Routes, Route } from 'react-router-dom';
import TransactionHistory from './TrsnsactionHistory';
import DashboardDetails from './DashboardDetails';
import SetBudget from './SetBudget';
import ProgressPage from './ProgressPage';
import DashboardComparison from './DashboardComparison';

function App() {
  return (
    <Routes>
      <Route path ="/" element={<Register />} />
      <Route path ="/home" element={<Home />} />
      <Route path ="/login" element={<Login />} />
      <Route path="/expense-categorisation" element={<ExpenseCategorisation />} />
      <Route path ="/history" element={<TransactionHistory />} />
      <Route path="/history/:id" element={<DashboardDetails />} />
      <Route path="/set-budget" element={<SetBudget />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/compare-dashboards" element={<DashboardComparison />} />
    </Routes>
  );
}

export default App;
