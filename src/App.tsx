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
import FinanceChat from './FinanceChat';
import ProgressHistory from './ProgressHistory';
import ProgressDetails from './ProgressDetails';
import BackButton from './BackButton';
import HistoryOptions from './HistoryOptions';

function App() {
  return (
    <>
      <BackButton />
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
        <Route path="/finance-chat" element={<FinanceChat />} />
        <Route path="/progress-history" element={<ProgressHistory />} />
        <Route path="/progress-history/:id" element={<ProgressDetails />} />
        <Route path="/back" element={<BackButton />} />
        <Route path="/history-options" element={<HistoryOptions />} />
      </Routes>
    </>
  );
}

export default App;
