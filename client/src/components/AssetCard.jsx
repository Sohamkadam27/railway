import React from 'react';
import { motion } from 'framer-motion';

export default function AssetCard({ item, onView }) {
  return (
    <motion.div layout className="card p-4 cursor-pointer" whileHover={{ y: -4 }} onClick={() => onView(item.uid)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">{item.vendor_name || 'Vendor'}</div>
          <h3 className="text-lg font-semibold">{item.name || item.uid}</h3>
        </div>
        <div className="text-right">
          <div className={`px-3 py-1 rounded-full text-xs ${item.condition_lot === 'Good' ? 'bg-green-800 text-green-100' : item.condition_lot === 'Needs Repair' ? 'bg-amber-800 text-amber-100' : 'bg-slate-800 text-slate-300'}`}>
            {item.condition_lot || 'Unknown'}
          </div>
          <div className="text-xs text-muted mt-2">Warranty: {item.warranty_expiry ? new Date(item.warranty_expiry).toLocaleDateString() : 'N/A'}</div>
        </div>
      </div>
    </motion.div>
  );
}