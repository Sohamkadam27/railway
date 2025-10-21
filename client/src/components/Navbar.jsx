import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="topbar fixed w-full z-50 flex items-center justify-between px-6 py-3 bg-surface border-b border-slate-800 shadow-lg">
      {/* Logo / Title */}
      <div className="text-accent font-bold text-xl cursor-pointer hover:text-cyan-400 transition-colors">
        <Link to="/">Railway Asset Portal</Link>
      </div>

      {/* Dropdown Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="btn bg-accent text-black font-semibold px-4 py-2 rounded-lg hover:bg-cyan-400 transition-all"
        >
          Menu
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-glow border border-slate-700 animate-dropdownEnter overflow-hidden">
            <Link
              to="/dashboard"
              className="block px-4 py-2 hover:bg-slate-800 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/assets"
              className="block px-4 py-2 hover:bg-slate-800 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              Assets
            </Link>
            <Link
              to="/reports"
              className="block px-4 py-2 hover:bg-slate-800 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              Reports
            </Link>
            <Link
              to="/calculate-fittings"
              className="block px-4 py-2 hover:bg-slate-800 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              Calculate Fittings
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-800 text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
