import React from 'react';
import Register from './Register';
import Home from './Home';
import Login from './Login';
import ExpenseCategorisation from './ExpenseCategorisation';
import { Routes, Route } from 'react-router-dom';
import TransactionHistory from './TransactionHistory';
import DashboardDetails from './DashboardDetails';
import SetBudget from './SetBudget';
import ProgressPage from './ProgressPage';
import DashboardComparison from './DashboardComparison';
import FinanceChat from './FinanceChat';
import ProgressHistory from './ProgressHistory';
import ProgressDetails from './ProgressDetails';
import BackButton from './BackButton';
import HistoryOptions from './HistoryOptions';
import BudgetHistory from './BudgetHistory';
import Layout from './Layout';

function App() {
  return (
    <>
      <BackButton />
      <Routes>
        <Route path ="/" element={<Register />} />
        <Route path ="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path ="/home" element={<Home />} />
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
          <Route path="/budget-history" element={<BudgetHistory />} />
        </Route>  
      </Routes>
    </>
  );
}

export default App;
