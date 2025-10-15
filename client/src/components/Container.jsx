import React from 'react';

export default function Container({ children }) {
  return (
    <div className="app-container">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}