// This file is responsible for categorising expenses based on user input
// The user will drag and drop a bank statement file here and tensorflows BERT model will be used to categorise each expense
// This is placeholder logic as I want to focus on the machine learning training and integration aspect of my project next

// imports needed for this file
import React, { useState, DragEvent, ChangeEvent} from 'react';

const ExpenseCategorisation: React.FC = () => {
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


return (
    // Page background + centering
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      {/* Main content box */}
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8">

        {/* Page title */}
        <h1 className="text-2xl font-bold mb-4 text-center">
          Expense Categorisation
        </h1>

        {/* Drag-and-drop zone */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition
            ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-400"}
          `}
          onDragOver={handleDrag}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >

          {/* Hidden file input (activated when clicking the label) */}
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Click-to-select label */}
          <label htmlFor="fileUpload" className="cursor-pointer">
            <p className="text-gray-700">Drag and drop your file here</p>
            <p className="text-gray-500 text-sm">or click to select</p>
          </label>
        </div>

        {/* Display selected file information */}
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

        {results && (
          <div className="mt-6 p-4 bg-green-50 border rounded">
            <h2 className="font-semibold mb-2">Results:</h2>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExpenseCategorisation;