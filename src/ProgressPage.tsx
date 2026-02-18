import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProgressPage: React.FC = () => {

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Tracks whether budget exists
  const [hasBudget, setHasBudget] = useState<boolean | null>(null);

  // Stores uploaded file
  const [file, setFile] = useState<File | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Stores backend comparison results
  const [results, setResults] = useState<any>(null);

  // ------------------------------------
  // STEP 1: Check if user has a budget
  // ------------------------------------
  const checkBudget = async () => {
    const res = await fetch(
      `http://127.0.0.1:8000/has-budget?userId=${userId}`
    );

    const data = await res.json();
    setHasBudget(data.hasBudget);
  };

  // ------------------------------------
  // STEP 2: Upload statement and check budget
  // ------------------------------------
  const uploadProgress = async () => {
    if (!file) {
      alert("Please select a bank statement first!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId!);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload-progress", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to process statement");
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to process your statement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        Budget Progress Tracker
      </h1>

      {/* ============================= */}
      {/* STEP 1 — CHECK BUDGET */}
      {/* ============================= */}

      {hasBudget === null && (
        <div className="text-center">
          <button
            onClick={checkBudget}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            Check My Budget
          </button>
        </div>
      )}

      {/* ============================= */}
      {/* NO BUDGET MESSAGE */}
      {/* ============================= */}

      {hasBudget === false && (
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">
            You must set a budget before tracking your progress.
          </p>
          <button
            onClick={() => window.location.href = "/set-budget"}
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition"
          >
            Set Budget Now
          </button>
        </div>
      )}

      {/* ============================= */}
      {/* STEP 2 — UPLOAD STATEMENT */}
      {/* ============================= */}

      {hasBudget === true && !results && (
        <div className="bg-white p-8 rounded shadow text-center max-w-xl mx-auto">
          <p className="mb-4 font-medium text-lg">
            Upload your bank statement to track budget progress
          </p>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            className="mb-4"
          />

          {file && (
            <p className="text-sm text-gray-600 mb-4">
              Selected: {file.name}
            </p>
          )}

          <button
            onClick={uploadProgress}
            disabled={loading || !file}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Track Progress"}
          </button>
        </div>
      )}

      {/* ============================= */}
      {/* STEP 3 — RESULTS */}
      {/* ============================= */}

      {results && (
        <div className="mt-10 space-y-8 max-w-4xl mx-auto">
          {/* -------------------------------- */}
          {/* OVERALL BUDGET STATUS */}
          {/* -------------------------------- */}

          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Overall Budget Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Monthly Budget</p>
                <p className="text-2xl font-bold text-blue-600">
                  €{results.budgetTotal.toFixed(2)}
                </p>
              </div>

              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-gray-800">
                  €{results.currentTotal.toFixed(2)}
                </p>
              </div>

              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">
                  {results.overallOverUnder <= 0 ? "Under Budget" : "Over Budget"}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    results.overallOverUnder <= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  €{Math.abs(results.overallOverUnder).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Overall Status Message */}
            <div
              className={`text-center py-4 rounded-lg ${
                results.overallOverUnder <= 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <p className="text-lg font-semibold">
                {results.overallOverUnder <= 0
                  ? "Great job! You stayed within your budget!"
                  : "You went over your budget this month"}
              </p>
            </div>
          </div>

          {/* -------------------------------- */}
          {/* CATEGORY BREAKDOWN */}
          {/* -------------------------------- */}

          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Category Breakdown
            </h2>

            <div className="space-y-4">
              {results.categories.map((cat: any) => {
                const isOverBudget = cat.overUnder > 0;
                const percentage = cat.budget > 0 
                  ? (cat.current / cat.budget) * 100 
                  : 0;

                return (
                  <div
                    key={cat.category}
                    className={`border-l-4 p-4 rounded ${
                      isOverBudget
                        ? "border-red-500 bg-red-50"
                        : "border-green-500 bg-green-50"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">
                        {cat.category}
                      </h3>
                      <span
                        className={`font-bold ${
                          isOverBudget ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isOverBudget ? "OVER" : "UNDER"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Budget</p>
                        <p className="font-semibold">
                          €{cat.budget.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600">Spent</p>
                        <p className="font-semibold">
                          €{cat.current.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600">
                          {isOverBudget ? "Over by" : "Under by"}
                        </p>
                        <p
                          className={`font-bold ${
                            isOverBudget ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          €{Math.abs(cat.overUnder).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            isOverBudget ? "bg-red-600" : "bg-green-600"
                          }`}
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-right">
                        {percentage.toFixed(0)}% of budget used
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* -------------------------------- */}
          {/* ACTION BUTTONS */}
          {/* -------------------------------- */}

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setResults(null)}
              className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 transition"
            >
              Track Another Month
            </button>

            <button
              onClick={() =>
                navigate("/set-budget", {
                  state: { month: results.statement_month }
                })
              }
              className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition"
            >
              Update Budget
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;