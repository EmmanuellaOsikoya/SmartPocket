import React, { useState } from "react";

/*
  This page:
  1. Checks if user has a budget
  2. Allows upload of next month's statement
  3. Displays progress comparison
*/

const BudgetProgress: React.FC = () => {

  const userId = localStorage.getItem("userId");

  const [hasBudget, setHasBudget] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Check if budget exists
  const checkBudget = async () => {

    const res = await fetch(
      `http://127.0.0.1:8000/has-budget?userId=${userId}`
    );

    const data = await res.json();
    setHasBudget(data.hasBudget);
  };

  // Upload next month file
  const uploadProgress = async () => {

    if (!file) {
      alert("Select a bank statement first");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId!);

    const res = await fetch("http://127.0.0.1:8000/upload-progress", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResults(data);

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-3xl font-bold text-center mb-8">
        Budget Progress Tracker
      </h1>

      {/* STEP 1 — CHECK BUDGET */}

      {hasBudget === null && (
        <div className="text-center">
          <button
            onClick={checkBudget}
            className="bg-blue-600 text-white px-6 py-3 rounded"
          >
            Check My Budget
          </button>
        </div>
      )}

      {/* NO BUDGET */}

      {hasBudget === false && (
        <p className="text-center text-red-600 text-lg">
          You must set a budget before tracking progress.
        </p>
      )}

      {/* STEP 2 — UPLOAD NEXT MONTH */}

      {hasBudget === true && !results && (
        <div className="bg-white p-8 rounded shadow text-center">

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
            className="block mx-auto mt-6 bg-purple-600 text-white px-6 py-2 rounded"
          >
            {loading ? "Processing..." : "Track Progress"}
          </button>
        </div>
      )}

      {/* STEP 3 — SHOW RESULTS */}

      {results && (
        <div className="mt-10 space-y-6">

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">
              Overall Performance
            </h2>

            <p>
              Budget: €{results.budgetTotal}
            </p>

            <p>
              This Month: €{results.currentTotal}
            </p>

            <p
              className={
                results.overallOverUnder <= 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              Over / Under: €{results.overallOverUnder}
            </p>

            <p className="font-semibold mt-2">
              Better month: {results.betterMonth}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              Category Comparison
            </h2>

            {results.categories.map((c: any) => (
              <div
                key={c.category}
                className="border-b py-3 flex justify-between"
              >
                <div>
                  <p className="font-medium">{c.category}</p>
                  <p className="text-sm text-gray-500">
                    Previous: €{c.previous} | Current: €{c.current}
                  </p>
                </div>

                <p
                  className={
                    c.overUnder <= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  €{c.overUnder}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default BudgetProgress;
