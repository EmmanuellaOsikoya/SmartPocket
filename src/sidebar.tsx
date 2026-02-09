import React from "react";
import { useNavigate } from "react-router-dom";

/*
  Sidebar component
  - Displays logged-in user
  - Provides logout functionality
  - Collapsible with toggle button
*/

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  // Get logged-in user's email from localStorage
  const email = localStorage.getItem("email");

  // Handle logout
  const handleLogout = () => {
    // Remove auth data
    localStorage.removeItem("userId");
    localStorage.removeItem("email");

    // Redirect to login page
    navigate("/login");
  };

  return (
    <>
      {/* Toggle button - always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded hover:bg-gray-700 transition"
      >
        {isOpen ? (
          // Close icon
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Menu icon
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Sidebar - slides in from left */}
      <div
        className={`fixed top-0 left-0 w-64 h-screen bg-gray-900 text-white flex flex-col p-6 z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* APP NAME */}
        <h2 className="text-2xl font-bold mb-10 text-center mt-12">
          SmartPocket
        </h2>

        {/* USER INFO */}
        <div className="mb-8">
          <p className="text-gray-400 text-sm mb-1">Logged in as</p>
          <p className="font-semibold break-words">
            {email}
          </p>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="mt-10 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Log Out
        </button>
      </div>

      {/* Overlay - closes sidebar when clicked */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}
    </>
  );
};

export default Sidebar;