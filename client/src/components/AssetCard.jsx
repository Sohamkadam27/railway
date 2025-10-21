import React from "react";
import { motion } from "framer-motion";

export default function AssetCard({ item = {}, onView }) {
  const {
    uid,
    name,
    vendor_name,
    condition_lot,
    warranty_expiry
  } = item;

  const conditionColor =
    condition_lot === "Good"
      ? "bg-green-800 text-green-100"
      : condition_lot === "Needs Repair"
      ? "bg-amber-800 text-amber-100"
      : "bg-slate-800 text-slate-300";

  return (
    <motion.div
      layout
      className="card p-4 cursor-pointer transition-all"
      whileHover={{ y: -4 }}
      onClick={() => uid && onView && onView(uid)}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">
            {vendor_name || "Unknown Vendor"}
          </div>
          <h3 className="text-lg font-semibold">
            {name || uid || "Unnamed Asset"}
          </h3>
        </div>
        <div className="text-right">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${conditionColor}`}
          >
            {condition_lot || "Unknown"}
          </div>
          <div className="text-xs text-muted mt-2">
            Warranty:{" "}
            {warranty_expiry
              ? new Date(warranty_expiry).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
