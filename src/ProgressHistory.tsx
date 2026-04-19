import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Component displays a list of past progress reports
const ProgressHistory: React.FC = () => {
  // Hook for navigation between routes
  const navigate = useNavigate();

  // States to store progress history, filtered results, loading status, and filter criteria
  const [history, setHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter inputs month and year
  const [month, setMonth] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");

  // Fetch progress history on component mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    fetch(`http://127.0.0.1:8000/progress-history?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        // Reverse data so most recent appears first
        const reversed = data.reverse();
        // Store full dataset
        setHistory(reversed);
        // Initially show all data (unfiltered)
        setFilteredHistory(reversed); 
      })
      // Stop loading once fetch completes
      .finally(() => setLoading(false));
  }, []);

  // Filters reports by selected month/year
  const applyFilter = () => {
    let filtered = [...history];

    // Only apply filter if at least one filter is selected
    if (month || year) {
      filtered = filtered.filter((item) => {
        const [y, m] = item.statement_month.split("-");
        const matchesMonth = month ? Number(m) === month : true;
        const matchesYear = year ? Number(y) === year : true;

        return matchesMonth && matchesYear;
      });
    }

    // Update filtered results
    setFilteredHistory(filtered);
  };

  if (loading) {
    return <div className="text-center mt-10">Loading progress reports...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Past Progress Reports
      </h1>

      <div className="flex justify-left mb-8">
        <button
          onClick={() => navigate("/progress")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Check Progress from Another Month
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        
        {/* Month dropdown */}
        <select
          value={month}
          onChange={(e) =>
            setMonth(e.target.value ? Number(e.target.value) : "")
          }
          className="border rounded px-4 py-2"
        >
          <option value="">All Months</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleString("default", {
                month: "long",
              })}
            </option>
          ))}
        </select>

        {/* Year input */}
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) =>
            setYear(e.target.value ? Number(e.target.value) : "")
          }
          className="border rounded px-4 py-2 w-28"
        />

        {/* Apply filter */}
        <button
          onClick={applyFilter}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Apply Filter
        </button>
      </div>

      {/* RESULTS */}
      {filteredHistory.length === 0 ? (
        <p className="text-center text-gray-500">
          No progress reports found for selected period.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredHistory.map((item) => {
            const [yearStr, monthStr] = item.statement_month.split("-");
            const dateObj = new Date(Number(yearStr), Number(monthStr) - 1);
            const formattedMonth = dateObj.toLocaleString("default", {
              month: "long",
              year: "numeric",
            });

            return (
              <div
                key={item._id}
                className="bg-white shadow-lg rounded-xl p-6"
              >
                <p className="text-sm text-gray-500 mb-2">{formattedMonth}</p>

                <p
                  className={`text-xl font-bold mb-2 ${
                    item.overallOverUnder <= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {item.overallOverUnder <= 0
                    ? "Under Budget"
                    : "Over Budget"}
                </p>

                <p>Total Spent: €{item.currentTotal.toFixed(2)}</p>
                <p>Budget: €{item.budgetTotal.toFixed(2)}</p>

                <button
                  onClick={() =>
                    navigate(`/progress-history/${item._id}`)
                  }
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressHistory;