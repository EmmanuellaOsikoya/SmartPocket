import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Page content renders here */}
      <div className="min-h-screen">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;