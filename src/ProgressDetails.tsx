import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProgressReportView from "./ProgressReportView";

const ProgressDetails: React.FC = () => {
  const { id } = useParams();
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/progress-history/${id}`)
      .then(res => res.json())
      .then(data => setResults(data));
  }, [id]);

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
