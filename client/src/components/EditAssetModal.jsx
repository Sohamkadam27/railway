// client/src/components/EditAssetModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../api/config";

export default function EditAssetModal({ item, onClose, onSaved }) {
  const [condition, setCondition] = useState(item.condition_lot || "");
  const [remarks, setRemarks] = useState(item.remarks || "");
  const [lastInspection, setLastInspection] = useState(
    item.last_inspection ? item.last_inspection.split("T")[0] : ""
  );
  const [latitude, setLatitude] = useState(item.latitude || "");
  const [longitude, setLongitude] = useState(item.longitude || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // 📍 Fetch current GPS location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      (err) => {
        console.error("Location error:", err);
        alert("Unable to retrieve location.");
        setIsLocating(false);
      }
    );
  };

  // 💾 Save updated asset
  const save = async () => {
    setIsSaving(true);
    try {
      const body = new URLSearchParams();
      body.append("condition_lot", condition);
      body.append("remarks", remarks);
      body.append("last_inspection", lastInspection);
      body.append("latitude", latitude);
      body.append("longitude", longitude);

      const res = await fetch(`${API_BASE}/assets/${encodeURIComponent(item.uid)}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const json = await res.json();

      if (res.ok) {
        onSaved && onSaved(json.item); // Notify parent component
      } else {
        alert("Update failed: " + (json.error || "Server error"));
      }
    } catch (err) {
      console.error(err);
      alert("A network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-xl card p-6 relative overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 text-lg"
          >
            ✕
          </button>

          <h3 className="text-xl font-semibold mb-4">
            Edit Asset: <span className="text-accent font-mono">{item.uid}</span>
          </h3>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full mt-1 bg-gray-900 p-2 rounded border border-slate-700 focus:outline-none focus:border-accent transition"
              >
                <option value="">Select</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Repair">Needs Repair</option>
                <option value="Need Replacement">Need Replacement</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-muted">Last Inspection</label>
              <input
                type="date"
                value={lastInspection}
                onChange={(e) => setLastInspection(e.target.value)}
                className="w-full mt-1 bg-gray-900 p-2 rounded border border-slate-700 focus:outline-none focus:border-accent transition"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="mt-4">
            <label className="text-sm text-muted">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full mt-1 bg-gray-900 p-2 rounded border border-slate-700 focus:outline-none focus:border-accent transition"
              rows="3"
            />
          </div>

          {/* Geo-Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm text-muted">Latitude</label>
              <input
                type="text"
                placeholder="e.g. 19.0760"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full mt-1 bg-gray-900 p-2 rounded border border-slate-700 focus:outline-none focus:border-accent transition"
              />
            </div>
            <div>
              <label className="text-sm text-muted">Longitude</label>
              <input
                type="text"
                placeholder="e.g. 72.8777"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full mt-1 bg-gray-900 p-2 rounded border border-slate-700 focus:outline-none focus:border-accent transition"
              />
            </div>
          </div>

          <div className="mt-3 text-right">
            <button
              onClick={getCurrentLocation}
              disabled={isLocating}
              className="text-sm px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {isLocating ? "Fetching Location..." : "Use Current Location"}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={isSaving}
              className="px-4 py-2 rounded bg-accent text-black hover:bg-blue-400 disabled:opacity-50 transition"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
