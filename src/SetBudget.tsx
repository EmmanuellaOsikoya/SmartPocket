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

  // Selected month state
  const [selectedMonth, setSelectedMonth] = useState<string>("");

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

    // Set default month to next month
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const defaultMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(defaultMonth);
  }, []);

  const handleCategoryChange = (category: string, value: string) => {
    setBudgetByCategory((prev) => ({
      ...prev,
      [category]: Number(value),
    }));
  };

  const handleSave = async () => {
    if (!selectedMonth) {
      alert("Please select a month");
      return;
    }

    const payload = {
      userId: localStorage.getItem("userId"),
      month: selectedMonth,
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
      navigate("/home");
    } catch (err) {
      alert("Error saving budget");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Set Budget</h1>

      {/* MONTH SELECTOR */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <label className="font-semibold text-lg">Select Month</label>
        <input
          type="month"
          className="w-full mt-3 p-3 border rounded"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

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
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate("/home")}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Cancel
        </button>
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