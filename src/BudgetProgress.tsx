import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BudgetProgress: React.FC = () => {
  const { timestamp } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/progress/${timestamp}`)
      .then((res) => res.json())
      .then((json) => setData(json));
  }, [timestamp]);

  if (!data) return <div>Loading...</div>;

  const overUnder = data.budget - data.spent;
  const good = overUnder >= 0;

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-3xl font-bold text-center mb-8">
        Budget Progress Report
      </h1>

      {/* MAIN SUMMARY */}
      <div className="bg-white p-6 shadow rounded mb-10">
        <p className="text-xl">
          Total Spent: <span className="font-bold">€{data.spent.toFixed(2)}</span>
        </p>
        <p className="text-xl">
          Budget: <span className="font-bold">€{data.budget.toFixed(2)}</span>
        </p>

        <p
          className={`text-2xl font-bold mt-4 ${
            good ? "text-green-600" : "text-red-600"
          }`}
        >
          {good
            ? `You are €${overUnder.toFixed(2)} UNDER budget`
            : `You are €${Math.abs(overUnder).toFixed(2)} OVER budget`}
        </p>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <h2 className="text-2xl font-semibold mb-4">Categories</h2>

      <div className="space-y-6">
        {data.categories.map((cat: any) => {
          const diff = cat.budget - cat.spent;
          const ok = diff >= 0;

          const percentage = cat.budget
            ? Math.min((cat.spent / cat.budget) * 100, 100)
            : 100;

          return (
            <div key={cat.category} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{cat.category}</span>
                <span>
                  Spent: €{cat.spent.toFixed(2)} / Budget: €{cat.budget.toFixed(2)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
                <div
                  className={`h-4 ${
                    ok ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Difference */}
              <p
                className={`mt-2 font-medium ${
                  ok ? "text-green-600" : "text-red-600"
                }`}
              >
                {ok
                  ? `€${diff.toFixed(2)} UNDER`
                  : `€${Math.abs(diff).toFixed(2)} OVER`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetProgress;
