// client/src/components/TrackFittingCalculator.jsx
import React, { useState } from "react";

export default function TrackFittingCalculator({ onClose }) {
  const [lineLength, setLineLength] = useState("");
  const [gaugeType, setGaugeType] = useState("BG");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setError("");
    setResult(null);

    // Validation
    if (!lineLength || lineLength <= 0) {
      setError("Please enter a valid line length (>0).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/fittings/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_length_km: parseFloat(lineLength),
          gauge_type: gaugeType,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Calculation failed.");

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg card p-6 bg-slate-900 rounded-lg shadow-lg relative">
        <h2 className="text-2xl font-semibold text-accent mb-4">
          Track Fitting Calculator
        </h2>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Line Length (km)
            </label>
            <input
              type="number"
              min="0"
              value={lineLength}
              onChange={(e) => setLineLength(e.target.value)}
              placeholder="Enter line length"
              className="w-full px-3 py-2 rounded bg-gray-800 border border-slate-700 text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Gauge Type</label>
            <select
              value={gaugeType}
              onChange={(e) => setGaugeType(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 border border-slate-700 text-white focus:outline-none focus:border-accent"
            >
              <option value="BG">BG</option>
              <option value="MG">MG</option>
              <option value="NG">NG</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mb-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
          >
            Close
          </button>
          <button
            onClick={handleCalculate}
            disabled={loading || !lineLength || lineLength <= 0}
            className="px-4 py-2 bg-accent text-black rounded hover:bg-blue-400 disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Calculate"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-sm mb-2 text-center bg-red-950/30 p-2 rounded">
            {error}
          </p>
        )}

        {/* Result Display */}
        {result && (
          <div className="bg-slate-800 p-4 rounded text-white space-y-1">
            <h3 className="text-accent font-semibold mb-2">Calculation Results:</h3>
            <p>
              <strong>Gauge Type:</strong> {result.gauge_type}
            </p>
            <p>
              <strong>Line Length (km):</strong>{" "}
              {result.line_length_km.toLocaleString()}
            </p>
            <p>
              <strong>Total Sleepers:</strong> {result.sleepers.toLocaleString()}
            </p>
            <p>
              <strong>Total Railpads:</strong> {result.railpads.toLocaleString()}
            </p>
            <p>
              <strong>Total Liners:</strong> {result.liners.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
