import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProgressHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    fetch(`http://127.0.0.1:8000/progress-history?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.reverse());
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading progress reports...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Past Progress Reports
      </h1>

      {history.length === 0 ? (
        <p className="text-center text-gray-500">
          No progress reports found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {history.map((item) => {
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
