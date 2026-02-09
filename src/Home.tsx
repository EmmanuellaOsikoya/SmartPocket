import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./sidebar";

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
    // Wrap everything in a parent container
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div
        className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center ml-64"
        style={{ backgroundImage: "url('/bgimage3.webp')" }}
      >
        <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-xs p-6 bg-white bg-opacity-80 rounded-lg shadow-lg">
          {/* Page title */}
          <h1 className="text-4xl font-bold mb-6 text-center">
            Welcome to SmartPocket!
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
              className="w-full bg-teal-500 text-white py-3 rounded hover:bg-teal-600 transition"
              onClick={() => navigate("/budget-tips")}
            >
              Get Budgeting Tips
            </button>
            <button
              className="w-full bg-rose-500 text-white py-3 rounded hover:bg-rose-600 transition"
              onClick={() => navigate("/progress")}
            >
              Track my Spending
            </button>
            <button
              className="w-full bg-purple-500 text-white py-3 rounded hover:bg-purple-600 transition"
              onClick={() => navigate("/history")}
            >
              View my Transaction History
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;