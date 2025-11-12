// This file is responsible for categorising expenses based on user input
// The user will drag and drop a bank statement file here and tensorflows BERT model will be used to categorise each expense
// This is placeholder logic as I want to focus on the machine learning training and integration aspect of my project next

// imports needed for this file
import React, { useState, DragEvent, ChangeEvent} from 'react';

const ExpenseCategorisation: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);

    // This tracks whether a file is being dragged over the dropping zone
    const [dragActive, setDragActive] = useState(false);

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
    if (!file) return alert("No file has been selected. Please select a file!");
    setLoading(true);
    setResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
       const res = await fetch("http://127.0.0.1:8000/upload", {
           method: "POST",
           body: formData,
       });

       if (!res.ok) {
           throw new Error("File upload failed");

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
      </div>
    </div>
  );
};

export default ExpenseCategorisation;