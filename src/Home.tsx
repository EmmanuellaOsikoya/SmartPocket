import React from "react";
import { useNavigate } from "react-router-dom";
// This will be the main page of operations for the SmartPocket application
const Home: React.FC = () => {
    const navigate = useNavigate();
    return (
    // Full screen container, centered
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      {/* Page title */}
      <h1 className="text-4xl font-bold mb-6 text-center">
        Welcome to SmartPocket
      </h1>
      <h2 className="text-2xl font-semibold mb-8 text-center">
        What would you like to do?
      </h2>

      {/* Buttons container */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition"
          onClick={() => navigate("/expense-categorisation")}
        >
          Put my expenditure into categories
        </button>
        <button
          className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition"
          onClick={() => navigate("/budget-tips")}
        >
          Get Budgeting Tips
        </button>
        <button
          className="w-full bg-yellow-500 text-white py-3 rounded hover:bg-yellow-600 transition"
          onClick={() => navigate("/track-spending")}
        >
          Track my Spending
        </button>
        <button
          className="w-full bg-purple-500 text-white py-3 rounded hover:bg-purple-600 transition"
          onClick={() => navigate("/predict-spending")}
        >
          Predict my Spending
        </button>
      </div>
    </div>
  );
};

export default Home;