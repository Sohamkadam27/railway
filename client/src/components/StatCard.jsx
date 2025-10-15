import React from 'react';

export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="card p-5 flex flex-col gap-2">
      <div className="text-xs text-muted">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && <div className="text-sm text-muted">{subtitle}</div>}
    </div>
  );
}