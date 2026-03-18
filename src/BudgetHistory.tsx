import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BudgetHistory: React.FC = () => {
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState<any[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;

    fetch(`http://127.0.0.1:8000/budget-history?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setBudgets(data);
        setFilteredBudgets(data); // default = all
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // FILTER FUNCTION
  const applyFilter = () => {
    let filtered = [...budgets];

    if (month || year) {
      filtered = filtered.filter((budget) => {
        const [y, m] = budget.month.split("-");
        const matchesMonth = month ? Number(m) === month : true;
        const matchesYear = year ? Number(y) === year : true;

        return matchesMonth && matchesYear;
      });
    }

    setFilteredBudgets(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading budgets...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Budget History
      </h1>

      <div className="flex justify-left mb-8">
        <button
          onClick={() => navigate("/set-budget")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Add New Budget
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
      {filteredBudgets.length === 0 ? (
        <p className="text-center text-gray-500">
          No budgets found for selected period.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredBudgets.map((budget) => {
            const [year, month] = budget.month.split("-");
            const formattedMonth = new Date(
              Number(year),
              Number(month) - 1
            ).toLocaleString("default", {
              month: "long",
              year: "numeric",
            });

            return (
              <div
                key={budget._id}
                className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition flex flex-col"
              >
                <p className="text-sm text-gray-500 mb-2">
                  {formattedMonth}
                </p>

                <p className="text-xl font-bold text-green-600 mb-4">
                  Total Budget: €{budget.totalBudget.toFixed(2)}
                </p>

                <button
                  onClick={() =>
                    navigate("/set-budget", {
                      state: { month: budget.month },
                    })
                  }
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
                >
                  Update Budget
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetHistory;