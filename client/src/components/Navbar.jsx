import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <nav className="topbar fixed w-full z-50 flex items-center justify-between px-6 py-3">
      <div className="text-accent font-bold text-xl cursor-pointer">
        <Link to="/">Railway Asset Portal</Link>
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="btn"
        >
          Menu
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-surface rounded-xl shadow-glow border border-slate-700 animate-dropdownEnter">
            <Link
              to="/dashboard"
              className="block px-4 py-2 hover:bg-slate-800 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/assets"
              className="block px-4 py-2 hover:bg-slate-800 transition-colors"
            >
              Assets
            </Link>
            <Link
              to="/reports"
              className="block px-4 py-2 hover:bg-slate-800 transition-colors"
            >
              Reports
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-slate-800 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
