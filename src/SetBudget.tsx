import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SetBudget: React.FC = () => {
  const navigate = useNavigate();

  // These categories should be identical to what you use in categorisation
  const CATEGORIES = [
    "Groceries",
    "Transport",
    "Food",
    "Subscriptions",
    "Education",
    "Transfers",
    "Other",
  ];

  // Total budget field
  const [totalBudget, setTotalBudget] = useState<number>(0);

  // Category budgets stored as object
  const [budgetByCategory, setBudgetByCategory] = useState<{ [key: string]: number }>(
    {}
  );

  // Prefill all categories to zero
  useEffect(() => {
    const initial = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    setBudgetByCategory(initial);
  }, []);

  const handleCategoryChange = (category: string, value: string) => {
    setBudgetByCategory((prev) => ({
      ...prev,
      [category]: Number(value),
    }));
  };

  const handleSave = async () => {
    const payload = {
      totalBudget,
      categories: budgetByCategory,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/save-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save budget");
      }

      alert("Budget saved successfully!");
      navigate("/"); // go back to dashboard
    } catch (err) {
      alert("Error saving budget");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Set Next Month Budget</h1>

      {/* TOTAL BUDGET */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <label className="font-semibold text-lg">Total Monthly Budget (€)</label>
        <input
          type="number"
          className="w-full mt-3 p-3 border rounded"
          value={totalBudget}
          onChange={(e) => setTotalBudget(Number(e.target.value))}
        />
      </div>

      {/* CATEGORY BUDGETS */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="font-semibold text-lg mb-4">Breakdown by Category</h2>

        <div className="space-y-4">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex justify-between items-center">
              <span className="font-medium">{cat}</span>

              <input
                type="number"
                className="w-32 p-2 border rounded text-right"
                value={budgetByCategory[cat]}
                onChange={(e) => handleCategoryChange(cat, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Save Budget
        </button>
      </div>
    </div>
  );
};

export default SetBudget;
