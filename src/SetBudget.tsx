import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

// SetBudget component allows users to set or update their monthly budget and category breakdown
const SetBudget: React.FC = () => {
  // Hooks to navigate between routes and access current route location
  const navigate = useNavigate();
  // Accesses the current route location to check if a month was passed as state (e.g., from history page)
  const location = useLocation();
  const passedMonth = (location.state as any)?.month;

  // Predefined categories for budget breakdown
  const CATEGORIES = [
    "Groceries",
    "Transport",
    "Food",
    "Subscriptions",
    "Education",
    "Transfers",
    "Other",
  ];

  // State variables to hold selected month, total budget, category breakdown, and loading status
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [budgetByCategory, setBudgetByCategory] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    // Initialize category budgets to 0 and set default month to next month if not passed from history page
    const initial = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    setBudgetByCategory(initial);

    if (passedMonth) {
      // If a month was passed via route state (e.g., from history page), use that as the selected month
      setSelectedMonth(passedMonth);
    } else {
      // Otherwise, default to the next month
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      const defaultMonth = `${nextMonth.getFullYear()}-${String(
        nextMonth.getMonth() + 1
      ).padStart(2, "0")}`;

      setSelectedMonth(defaultMonth);
    }
  }, [passedMonth]);

  // Load existing budget when month changes
  useEffect(() => {
    if (!selectedMonth) return;

    const loadBudget = async () => {
      const userId = localStorage.getItem("userId");

      try {
        // Fetch budget for selected month
        const res = await fetch(
          `http://127.0.0.1:8000/get-budget?userId=${userId}&month=${selectedMonth}`
        );

        const data = await res.json();

        if (data.hasBudget === false) {
          // If no budget exists for this month, reset category budgets and total budget to 0
          const initial = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
          setBudgetByCategory(initial);
          setTotalBudget(0);
        } else {
          // If a budget exists, populate the form with the existing values
          setTotalBudget(data.totalBudget || 0);
          setBudgetByCategory(data.categories || {});
        }
      } catch (err) {
        console.error("Error loading budget:", err);
      }
    };

    loadBudget();
  }, [selectedMonth]);

  // Category Input
  const handleCategoryChange = (category: string, value: string) => {
    setBudgetByCategory((prev) => ({
      ...prev,
      [category]: Number(value),
    }));
  };

  // Save the budget to the backend API and handle the response
  const handleSave = async () => {
    if (!selectedMonth) {
      alert("Please select a month");
      return;
    }

    setLoading(true);

    // Prepare payload for API
    const payload = {
      userId: localStorage.getItem("userId"),
      month: selectedMonth,
      totalBudget,
      categories: budgetByCategory,
    };

    try {
      // Send POST request to save the budget
      const res = await fetch("http://127.0.0.1:8000/save-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save budget");
      }

      const data = await res.json();
      // Show success message from backend response or default message
      alert(data.message || "Budget saved successfully!");

      // Reset form values so user can enter another budget
      const initial = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
      setBudgetByCategory(initial);
      setTotalBudget(0);

    } catch (err) {
      console.error("Error:", err);
      alert("Error saving budget");
    } finally {
      setLoading(false);
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

        <p className="text-sm text-gray-600 mt-2">
          {Object.values(budgetByCategory).some((v) => v > 0)
            ? "Budget exists for this month, you can update it if you would like"
            : "No budget set for this month yet"}
        </p>
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
                value={budgetByCategory[cat] || 0}
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
          disabled={loading}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Budget"}
        </button>
      </div>
    </div>
  );
};

export default SetBudget;