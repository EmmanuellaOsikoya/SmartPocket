import React, { useEffect, useState } from "react";

const TransactionHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/history")
      .then((res) => res.json())
      .then((data) => {
        // Sort newest first
        const sorted = data.reverse();
        setHistory(sorted);
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
      })
      .finally(() => {
        setLoading(false);
      });
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

      {history.length === 0 ? (
        <p className="text-center text-gray-500">
          No saved dashboards found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {history.map((item, index) => (
            <div
              key={item._id}
              className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition"
            >
              {/* Timestamp */}
              <p className="text-sm text-gray-500 mb-2">
                {new Date(item.timestamp).toLocaleString()}
              </p>

              {/* NET BALANCE */}
              <p
                className={`text-xl font-bold mb-2 ${
                  item.net_balance >= 0
                    ? "text-green-600"
                    : "text-red-600"
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

              {/* BUTTON */}
              <button
                className="mt-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
