import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DashboardComparison: React.FC = () => {
  const userId = localStorage.getItem("userId");

  // All available dashboards
  const [dashboards, setDashboards] = useState<any[]>([]);

  // Selected dashboard IDs
  const [selectedDashboard1, setSelectedDashboard1] = useState<string>("");
  const [selectedDashboard2, setSelectedDashboard2] = useState<string>("");

  // Full dashboard data for the two selected
  const [dashboard1Data, setDashboard1Data] = useState<any>(null);
  const [dashboard2Data, setDashboard2Data] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  // Fetch all dashboards on mount
  useEffect(() => {
    if (!userId) return;

    fetch(`http://127.0.0.1:8000/history?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDashboards(data.reverse()); // Most recent first
        }
      })
      .catch((err) => console.error("Error fetching dashboards:", err));
  }, [userId]);

  // Fetch detailed data for selected dashboards
  const fetchComparison = async () => {
    if (!selectedDashboard1 || !selectedDashboard2) {
      alert("Please select two dashboards to compare");
      return;
    }

    if (selectedDashboard1 === selectedDashboard2) {
      alert("Please select two different dashboards");
      return;
    }

    setLoading(true);

    try {
      const [res1, res2] = await Promise.all([
        fetch(`http://127.0.0.1:8000/history/${selectedDashboard1}`),
        fetch(`http://127.0.0.1:8000/history/${selectedDashboard2}`),
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      setDashboard1Data(data1);
      setDashboard2Data(data2);
    } catch (err) {
      console.error("Error fetching comparison:", err);
      alert("Failed to load comparison data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!dashboard1Data || !dashboard2Data) return [];

    // Get all unique categories from both dashboards
    const allCategories = new Set([
      ...Object.keys(dashboard1Data.categories),
      ...Object.keys(dashboard2Data.categories),
    ]);

    return Array.from(allCategories).map((category) => ({
      name: category,
      Dashboard1: dashboard1Data.categories[category] || 0,
      Dashboard2: dashboard2Data.categories[category] || 0,
    }));
  };

  const chartData = prepareChartData();

  // Format month display
  const formatMonth = (monthStr: string) => {
    if (!monthStr) return "Unknown";
    const [year, month] = monthStr.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        Compare Dashboards
      </h1>

      {/* DASHBOARD SELECTORS */}
      <div className="bg-white p-6 rounded-lg shadow mb-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Select Two Dashboards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dashboard 1 Selector */}
          <div>
            <label className="block font-medium mb-2">Dashboard 1</label>
            <select
              value={selectedDashboard1}
              onChange={(e) => setSelectedDashboard1(e.target.value)}
              className="w-full border rounded px-4 py-2"
            >
              <option value="">-- Select Dashboard --</option>
              {dashboards.map((dash) => (
                <option key={dash._id} value={dash._id}>
                  {formatMonth(dash.statement_month)} - Net: €
                  {dash.net_balance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Dashboard 2 Selector */}
          <div>
            <label className="block font-medium mb-2">Dashboard 2</label>
            <select
              value={selectedDashboard2}
              onChange={(e) => setSelectedDashboard2(e.target.value)}
              className="w-full border rounded px-4 py-2"
            >
              <option value="">-- Select Dashboard --</option>
              {dashboards.map((dash) => (
                <option key={dash._id} value={dash._id}>
                  {formatMonth(dash.statement_month)} - Net: €
                  {dash.net_balance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={fetchComparison}
          disabled={loading}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Compare Dashboards"}
        </button>
      </div>

      {/* COMPARISON RESULTS */}
      {dashboard1Data && dashboard2Data && (
        <div className="space-y-8">
          {/* OVERVIEW CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dashboard 1 Overview */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-blue-600">
                {formatMonth(dashboard1Data.statement_month)}
              </h3>

              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Total Income:</span>
                  <span className="font-semibold text-green-600">
                    €{dashboard1Data.total_income.toFixed(2)}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-600">Total Outcome:</span>
                  <span className="font-semibold text-red-600">
                    €{dashboard1Data.total_outcome.toFixed(2)}
                  </span>
                </p>

                <p className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600">Net Balance:</span>
                  <span
                    className={`font-bold ${
                      dashboard1Data.net_balance >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    €{dashboard1Data.net_balance.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>

            {/* Dashboard 2 Overview */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-orange-600">
                {formatMonth(dashboard2Data.statement_month)}
              </h3>

              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Total Income:</span>
                  <span className="font-semibold text-green-600">
                    €{dashboard2Data.total_income.toFixed(2)}
                  </span>
                </p>

                <p className="flex justify-between">
                  <span className="text-gray-600">Total Outcome:</span>
                  <span className="font-semibold text-red-600">
                    €{dashboard2Data.total_outcome.toFixed(2)}
                  </span>
                </p>

                <p className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600">Net Balance:</span>
                  <span
                    className={`font-bold ${
                      dashboard2Data.net_balance >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    €{dashboard2Data.net_balance.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* BETTER PERFORMER */}
          <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">Better Performer</h3>
            <p className="text-2xl font-bold text-green-600">
              {dashboard1Data.total_outcome < dashboard2Data.total_outcome
                ? formatMonth(dashboard1Data.statement_month)
                : formatMonth(dashboard2Data.statement_month)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              (Lower total spending)
            </p>
          </div>

          {/* DUAL BAR CHART */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-6 text-center">
              Category Spending Comparison
            </h3>

            <div className="w-full h-96">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => `€${value.toFixed(2)}`}
                  />
                  <Legend />

                  <Bar
                    dataKey="Dashboard1"
                    fill="#2563eb"
                    name={formatMonth(dashboard1Data.statement_month)}
                  />

                  <Bar
                    dataKey="Dashboard2"
                    fill="#f97316"
                    name={formatMonth(dashboard2Data.statement_month)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CATEGORY BREAKDOWN TABLE */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Detailed Category Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-right">
                      {formatMonth(dashboard1Data.statement_month)}
                    </th>
                    <th className="px-4 py-2 text-right">
                      {formatMonth(dashboard2Data.statement_month)}
                    </th>
                    <th className="px-4 py-2 text-right">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => {
                    const diff = row.Dashboard1 - row.Dashboard2;
                    return (
                      <tr key={row.name} className="border-b">
                        <td className="px-4 py-2 font-medium">{row.name}</td>
                        <td className="px-4 py-2 text-right">
                          €{row.Dashboard1.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          €{row.Dashboard2.toFixed(2)}
                        </td>
                        <td
                          className={`px-4 py-2 text-right font-semibold ${
                            diff > 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {diff > 0 ? "+" : ""}€{diff.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardComparison;