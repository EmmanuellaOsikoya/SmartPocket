import React from "react";
import { useNavigate } from "react-router-dom";

const HistoryOptions: React.FC = () => {
    const navigate = useNavigate();
    return (

      <div
        className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/bgimage3.webp')" }}
      >
        <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-xs p-6 bg-white bg-opacity-80 rounded-lg shadow-lg">
          {/* Page title */}
          <h1 className="text-4xl font-bold mb-6 text-center">
            Please select one of the following options:
          </h1>

          {/* Buttons container */}
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition"
              onClick={() => navigate("/history")}
            >
              Look at past expenditure
            </button>
            <button
              className="w-full bg-rose-500 text-white py-3 rounded hover:bg-rose-600 transition"
              onClick={() => navigate("/progress-history")}
            >
              Look at past progress reports
            </button>
            <button
              className="w-full bg-purple-500 text-white py-3 rounded hover:bg-purple-600 transition"
              onClick={() => navigate("/budget-history")}
            >
              Look at past budgets
            </button>
          </div>
        </div>
      </div>
  );
};

export default HistoryOptions;