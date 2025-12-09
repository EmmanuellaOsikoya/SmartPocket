import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DashboardDetails: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/history/${id}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  if (!data) {
    return <div>Dashboard not found.</div>;
  }

  const totalIncome = data.total_income;
  const totalOutcome = data.total_outcome;
  const netBalance = data.net_balance;

  // Pie chart: transform categories → array
  const categoryData = Object.entries(data.categories).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    "#2563eb",
    "#dc2626",
    "#16a34a",
    "#d97706",
    "#9333ea",
    "#0d9488",
    "#be185d",
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Dashboard Details
      </h1>

      <p className="text-center text-sm text-gray-500 mb-8">
        {new Date(data.timestamp).toLocaleString()}
      </p>

      {/* RECREATE THE WHOLE DASHBOARD UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Income */}
        <div className="bg-white shadow-md border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Income</h2>
          {data.income.map((tx: any, i: number) => (
            <div key={i} className="border-b py-2">
              <div className="flex justify-between">
                <span>{tx.description}</span>
                <span className="text-green-600 font-semibold">
                  +€{tx.amount.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500">{tx.date}</p>
            </div>
          ))}

          <p className="font-bold text-green-700 mt-4">
            Total Income: €{totalIncome.toFixed(2)}
          </p>
        </div>

        {/* Outcome */}
        <div className="bg-white shadow-md border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-700 mb-4">Outcome</h2>
          {data.outcome.map((tx: any, i: number) => (
            <div key={i} className="border-b py-2">
              <div className="flex justify-between">
                <span>{tx.description}</span>
                <span className="text-red-600 font-semibold">
                  -€{Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>

              <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {tx.category}
              </span>
            </div>
          ))}

          <p className="font-bold text-red-700 mt-4">
            Total Outcome: €{totalOutcome.toFixed(2)}
          </p>
        </div>

        {/* Net + Pie */}
        <div className="flex flex-col gap-6">

          <div className="bg-white shadow-md border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Net Balance</h2>
            <p
              className={`text-3xl font-bold ${
                netBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              €{netBalance.toFixed(2)}
            </p>
          </div>

          <div className="bg-white shadow-md border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-center mb-2">
              Spending Breakdown
            </h3>

            <div className="w-full h-80">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent = 0 }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDetails;
