import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Backbutton component renders a floating back button
const BackButton: React.FC = () => {
  // Gets the current route location (e.g., "/history") and navigation function
  const location = useLocation();
  const navigate = useNavigate();

  // Hides the button on the home page
  if (location.pathname === "/") return null;

  return (
    <button
      // Navuigates back to the previous page when clicked
      onClick={() => navigate(-1)}

      // Styles the button to be fixed at the top-left corner with some padding and hover effect
      className="fixed top-6 left-6 bg-white shadow-md px-4 py-2 rounded-lg hover:bg-gray-100 transition z-50"
    >
      ← Back
    </button>
  );
};

export default BackButton;
