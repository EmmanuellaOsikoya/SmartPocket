import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProgressReportView from "./ProgressReportView";

// Component fetched and displays the progress report for a specific budget based on the ID from the URL
const ProgressDetails: React.FC = () => {
  const { id } = useParams();
  // State to store fetched progress report results
  const [results, setResults] = useState<any>(null);

  // Fetch progress data when component mounts or ID changes
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/progress-history/${id}`)
      .then(res => res.json())
      .then(data => setResults(data));
  }, [id]);

  // Show loading message until data is available
  if (!results) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        Budget Progress Tracker
      </h1>

      <ProgressReportView results={results} />
    </div>
  );
};

export default ProgressDetails;
