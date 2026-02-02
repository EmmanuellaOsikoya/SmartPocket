import React, { useState } from "react";

/*
  Recharts imports for dual bar chart
*/
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/*
  This page handles:

  1. Checking if user has a saved budget
  2. Uploading next month's bank statement
  3. Displaying progress comparison
  4. Showing results in a dual bar chart
*/

const BudgetProgress: React.FC = () => {

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

    // true = budget exists
    // false = no budget yet
    setHasBudget(data.hasBudget);
  };

  // ------------------------------------
  // STEP 2: Upload next month statement
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

    const res = await fetch(
      "http://127.0.0.1:8000/upload-progress",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    setResults(data);

    setLoading(false);
  };

  // ------------------------------------
  // Prepare chart data
  // ------------------------------------
  /*
    Backend sends:

    results.categories = [
      {
        category: "Food",
        current: 200,
        previous: 150,
        budget: 180,
        overUnder: 20
      },
      ...
    ]

    Recharts wants:

    [
      { name: "Food", current: 200, previous: 150 },
      ...
    ]
  */

  const chartData =
    results?.categories?.map((c: any) => ({
      name: c.category,
      Current: c.current,
      Previous: c.previous,
    })) || [];

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
        <p className="text-center text-red-600 text-lg">
          You must set a budget before tracking your progress.
        </p>
      )}

      {/* ============================= */}
      {/* STEP 2 — UPLOAD NEXT MONTH */}
      {/* ============================= */}

      {hasBudget === true && !results && (
        <div className="bg-white p-8 rounded shadow text-center max-w-xl mx-auto">

          <p className="mb-4 font-medium">
            Upload next month's bank statement
          </p>

          <input
            type="file"
            onChange={(e) =>
              e.target.files && setFile(e.target.files[0])
            }
          />

          <button
            onClick={uploadProgress}
            disabled={loading}
            className="block mx-auto mt-6 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
          >
            {loading ? "Processing..." : "Track Progress"}
          </button>
        </div>
      )}

      {/* ============================= */}
      {/* STEP 3 — RESULTS */}
      {/* ============================= */}

      {results && (
        <div className="mt-10 space-y-8">

          {/* -------------------------------- */}
          {/* OVERALL PERFORMANCE CARD */}
          {/* -------------------------------- */}

          <div className="bg-white p-6 rounded shadow max-w-xl mx-auto">

            <h2 className="text-xl font-semibold mb-2">
              Overall Performance
            </h2>

            <p>
              Monthly Budget: €{results.budgetTotal}
            </p>

            <p>
              Current Month Spending: €{results.currentTotal}
            </p>

            <p
              className={
                results.overallOverUnder <= 0
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              Over / Under Budget: €{results.overallOverUnder}
            </p>

            <p className="mt-2 font-medium">
              Better Performing Month: {results.betterMonth}
            </p>
          </div>

          {/* -------------------------------- */}
          {/* DUAL BAR CHART COMPARISON */}
          {/* -------------------------------- */}

          <div className="bg-white p-6 rounded shadow">

            <h2 className="text-xl font-semibold mb-6 text-center">
              Category Spending Comparison
            </h2>

            <div className="w-full h-96">

              <ResponsiveContainer>

                <BarChart data={chartData}>

                  {/* X axis shows categories */}
                  <XAxis dataKey="name" />

                  {/* Y axis is money spent */}
                  <YAxis />

                  {/* Hover info */}
                  <Tooltip
                    formatter={(value: number) => `€${value.toFixed(2)}`}
                  />

                  {/* Legend */}
                  <Legend />

                  {/* 
                    Previous month (ORANGE) 
                  */}
                  <Bar
                    dataKey="Previous"
                    fill="#f97316"
                    name="Previous Month"
                  />

                  {/* 
                    Current month (BLUE) 
                  */}
                  <Bar
                    dataKey="Current"
                    fill="#2563eb"
                    name="Current Month"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;
