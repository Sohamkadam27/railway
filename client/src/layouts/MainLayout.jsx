import React from "react";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="app-container relative min-h-screen bg-bg text-white">
      <Navbar />
      <main className="pt-20 px-6 transition-all duration-300 ease-in-out">
        {children}
      </main>
    </div>
  );
}
