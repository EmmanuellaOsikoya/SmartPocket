import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProgressPage: React.FC = () => {
  const { month } = useParams(); // from URL
  const [progress, setProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/progress/${month}`)
      .then((res) => res.json())
      .then((data) => setProgress(data))
      .catch(() => setProgress(null))
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading progress...
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-600">
        No progress available.
      </div>
    );
  }

  const {
    total_budget,
    total_spent,
    overall_difference,
    categories,
    previous_month,
  } = progress;

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Budget Progress for {month}
      </h1>

      <p className="text-center text-gray-600 mb-8">
        Comparing to last month's budget: <b>{previous_month}</b>
      </p>

      {/* OVERALL DIFFERENCE */}
      <div className="bg-white rounded-xl shadow p-6 mb-10">
        <h2 className="text-xl font-semibold mb-2">Overall</h2>

        <p
          className={`text-2xl font-bold ${
            overall_difference >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          €{Math.abs(overall_difference).toFixed(2)}{" "}
          {overall_difference >= 0 ? "under budget " : "over budget "}
        </p>

        <p className="text-gray-600 mt-2">
          You planned to spend €{total_budget.toFixed(2)} and actually spent
          €{total_spent.toFixed(2)}.
        </p>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-6">
          Category Breakdown
        </h2>

        <div className="space-y-6">
          {Object.entries(categories).map(([cat, info]: any) => {
            const { budget, spent, difference } = info;

            const percentage =
              budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

            return (
              <div key={cat}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{cat}</span>
                  <span
                    className={`font-semibold ${
                      difference >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {difference >= 0 ? "+" : "-"}€
                    {Math.abs(difference).toFixed(2)}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded h-3">
                  <div
                    className={`h-3 rounded ${
                      difference >= 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Budget: €{budget.toFixed(2)} — Spent: €
                  {spent.toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
