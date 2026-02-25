import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");

  const fetchHistory = () => {
  setLoading(true);

  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("You must be logged in to view transaction history.");
    return;
  }

  let url = `http://127.0.0.1:8000/history?userId=${userId}`;

  const params = [];
  if (month) params.push(`&month=${month}`);
  if (year) params.push(`&year=${year}`);

  if (params.length > 0) url += "&" + params.join("&");

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setHistory(data.reverse());
      } else {
        console.error("Unexpected response:", data);
        setHistory([]);
      }
    })
    .finally(() => setLoading(false));
};


  useEffect(() => {
  fetchHistory();
}, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading history...
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Past Dashboards
      </h1>

        <div className="flex justify-left mb-8">
       <button
            onClick={() => navigate("/expense-categorisation")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Track new Expenditure
          </button>
          </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        
        {/* Month dropdown */}
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border rounded px-4 py-2"
        >
          <option value="">All Months</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        {/* Year input */}
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded px-4 py-2 w-28"
        />

        {/* Apply filter */}
        <button
          onClick={fetchHistory}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Apply Filter
        </button>
      </div>

       {/* RESULTS */}
      {history.length === 0 ? (
        <p className="text-center text-gray-500">
          No dashboards found for selected period.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {history.map((item) => {
            // Convert "YYYY-MM" → pretty month name
            let formattedMonth = item.statement_month;
            if (item.statement_month) {
              const [yearStr, monthStr] = item.statement_month.split("-");
              const dateObj = new Date(Number(yearStr), Number(monthStr) - 1);
              formattedMonth = dateObj.toLocaleString("default", {
                month: "long",
                year: "numeric",
              });
            }


            return (
              <div
                key={item._id}
                className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition flex flex-col"
              >
                {/* Month */}
                <p className="text-sm text-gray-500 mb-2">{formattedMonth}</p>

                {/* NET BALANCE */}
                <p
                  className={`text-xl font-bold mb-2 ${
                    item.net_balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Net Balance: €{item.net_balance.toFixed(2)}
                </p>

                {/* TOTAL INCOME */}
                <p className="text-green-700 font-medium">
                  Total Income: €{item.total_income.toFixed(2)}
                </p>

                {/* TOTAL OUTCOME */}
                <p className="text-red-700 font-medium mb-4">
                  Total Outcome: €{item.total_outcome.toFixed(2)}
                </p>

                <div className="mt-auto flex flex-col gap-2">
                {/* VIEW DETAILS */}
                <button
                  onClick={() => navigate(`/history/${item._id}`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                >
                  View Details
                </button>

              </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


export default TransactionHistory;
