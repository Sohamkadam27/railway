import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function ChartCard({ title, labels = [], data = [] }) {
  const chartData = {
    labels,
    datasets: [{
      label: title,
      data,
      borderColor: 'rgba(14, 165, 233, 0.8)',
      backgroundColor: 'rgba(14, 165, 233, 0.2)',
      tension: 0.25,
      fill: true,
      borderWidth: 2
    }]
  };
  
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  }

  return (
    <div className="card">
      <h4 className="font-semibold mb-3">{title}</h4>
      <Line data={chartData} options={options} />
    </div>
  );
}