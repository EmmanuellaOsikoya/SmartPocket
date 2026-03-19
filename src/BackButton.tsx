import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BackButton: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on home page
  if (location.pathname === "/") return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="fixed top-6 left-6 bg-white shadow-md px-4 py-2 rounded-lg hover:bg-gray-100 transition z-50"
    >
      ← Back
    </button>
  );
};

export default BackButton;
