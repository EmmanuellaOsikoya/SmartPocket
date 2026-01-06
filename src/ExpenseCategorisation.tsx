// This file is responsible for categorising expenses based on user input
// The user will drag and drop a bank statement file here and tensorflows BERT model will be used to categorise each expense
// This is placeholder logic as I want to focus on the machine learning training and integration aspect of my project next

// imports needed for this file
import React, { useState, DragEvent, ChangeEvent} from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from 'react-router-dom';

// Colours for categories and pie chart slices
const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "#2563eb",
  Transport: "#dc2626",
  Food: "#16a34a",
  Subscriptions: "#d97706",
  Education: "#9333ea",
  Transfers: "#0d9488",
  Other: "#be185d",
};

const ExpenseCategorisation: React.FC = () => {
    const navigate = useNavigate();

    const [file, setFile] = useState<File | null>(null);

    // This tracks whether a file is being dragged over the dropping zone
    const [dragActive, setDragActive] = useState(false);

    // Tracks upload and processing state
    const [loading, setLoading] = useState(false);

    // Stores categorisation results from backend
    const [results, setResults] = useState<any | null>(null);

    // This is triggered when a file is dragged over the dropping zone
    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragActive(true);
};

// This is triggered when a file is dragged away from the dropping zone
const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
};

const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    // This ensures that a valid file is dropped/exists
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setFile(e.dataTransfer.files[0]);
    }
};

// This is triggered when the user selects a file using file picker
const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
    }
};

// Logic that will upload the bank statement file to backend for processing 
const handleUpload = async () => {
    // Ensures a file is selected
    if (!file) return alert("No file has been selected. Please select a file!");
    setLoading(true);
    setResults(null);

    // Prepares the file for upload
    const formData = new FormData();
    formData.append('file', file);

    // Uploads the file to the backend
    try {
       const res = await fetch("http://127.0.0.1:8000/upload", {
           method: "POST",
           body: formData,
       });

       // Checks if the upload was successful
       if (!res.ok) {
           throw new Error("File upload failed");

       }

      // Parses and stores the response from the backend 
      const data = await res.json();
      setResults(data);

      } catch (err) {
          console.error(err);
          alert("An error occurred while uploading the file. Please try again.");
      } finally {
          setLoading(false);
      }
    };
    
    //The total income and the total outcome
        // Calculate total income
        const totalIncome = results?.income?.reduce(
        (sum: number, tx: any) => sum + tx.amount,
        0
        );

        // Calculate total outcome (absolute values)
        const totalOutcome = results?.outcome?.reduce(
        (sum: number, tx: any) => sum + Math.abs(tx.amount),
        0
        );

        //Calculates the net balance
        const netBalance = totalIncome - totalOutcome;

// This sections is for categorising expenses into percentages in pie charts
let categoryData: any[] = [];

if (results?.outcome) {
  // Create a map of category → total amount
  const categoryTotals: Record<string, number> = {};

  results.outcome.forEach((tx: any) => {
    const cat = tx.category || "Other";
    const amount = Math.abs(tx.amount);

    if (!categoryTotals[cat]) {
      categoryTotals[cat] = 0;
    }
    categoryTotals[cat] += amount;
  });

  // Convert map → array for Recharts
  categoryData = Object.entries(categoryTotals).map(([category, total]) => ({
    name: category,
    value: total,
  }));
}

return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="max-w-7xl w-full bg-white shadow-lg rounded-lg p-10">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Expense Categorisation
        </h1>

        {/* UPLOAD AREA */}
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-400"
          }`}
          onDragOver={handleDrag}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label htmlFor="fileUpload" className="cursor-pointer">
            <p className="text-gray-700">Drag and drop your file here</p>
            <p className="text-gray-500 text-sm">or click to select</p>
          </label>
        </div>

        {file && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="font-medium">Selected File:</p>
            <p className="text-sm text-gray-700">{file.name}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="mt-6 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Upload & Categorise"}
        </button>

        {/* RESULTS */}
        {results && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* INCOME */}
            <div className="bg-white shadow-md border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-700 mb-4">
                Income
              </h2>

              {results.income.map((tx: any, idx: number) => (
                <div key={tx.date + tx.description +idx} className="border-b py-2">
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

            {/* OUTCOME */}
            <div className="bg-white shadow-md border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-700 mb-4">
                Outcome
              </h2>

              {results.outcome.map((tx: any, idx: number) => (
                <div key={idx} className="border-b py-2">
                  <div className="flex justify-between">
                    <span>{tx.description}</span>
                    <span className="text-red-600 font-semibold">
                      -€{Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>

                  {/* Category badge */}
                  <span
                    className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[tx.category] + "22",
                      color: CATEGORY_COLORS[tx.category],
                    }}
                  >
                    {tx.category}
                  </span>
                </div>
              ))}

              <p className="font-bold text-red-700 mt-4">
                Total Outcome: €{totalOutcome.toFixed(2)}
              </p>
            </div>

            {/* NET + PIE */}
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
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[entry.name] || "#999"}
                          />
                        ))}
                      </Pie>

                      {/* Tooltip now shows € */}
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `€${value.toFixed(2)}`,
                          name,
                        ]}
                      />

                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default ExpenseCategorisation;