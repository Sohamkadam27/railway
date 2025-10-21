// client/src/pages/AssetDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "../components/Topbar";
import Container from "../components/Container";
import useFetch from "../hooks/useFetch";
import EditAssetModal from "../components/EditAssetModal";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Reusable PieChart Card Component
function PieChartCard({ title, data }) {
  if (!data || data.length === 0) return <p className="text-gray-400 text-sm">No data available.</p>;

  // Helper for dynamic colors
  const getColor = (index, total) => `hsl(${(index * 360) / total}, 70%, 50%)`;

  // Ensure slices are visible
  const safeData = data.map(d => ({ ...d, value: Math.max(d.value || 0, 1) }));

  return (
    <div className="card hover:shadow-glow transition p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={safeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {safeData.map((_, index) => (
                <Cell key={index} fill={getColor(index, safeData.length)} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function AssetDetail() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [dataKey, setDataKey] = useState(0);

  const { data, loading, error } = useFetch(`/assets/${encodeURIComponent(uid)}`, [uid, dataKey]);

  const handleSave = () => {
    setEditing(false);
    setDataKey(prev => prev + 1);
  };

  const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const scaleIn = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } };
  const fadeInUpProps = { initial: "hidden", animate: "visible", variants: fadeInUp };
  const scaleInProps = { variants: scaleIn };

  if (loading) {
    return (
      <>
        <Topbar />
        <Container>
          <motion.div className="p-6 card text-center text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Loading asset details...
          </motion.div>
        </Container>
      </>
    );
  }

  if (error || !data || !data.item) {
    return (
      <>
        <Topbar />
        <Container>
          <motion.div className="p-6 card text-center text-red-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Error: Asset not found or failed to load.
          </motion.div>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded transition"
            >
              Go Back
            </button>
          </div>
        </Container>
      </>
    );
  }

  const { item, assemblyRemark, vendorReport = [], inventoryReport = [] } = data;

  // Prepare Vendor Context Pie Data
  const vendorContextPieData = [
    { name: "Good Condition", value: vendorReport.reduce((sum, v) => sum + (v.good_condition || 0), 0) },
    { name: "Needs Repair", value: vendorReport.reduce((sum, v) => sum + (v.needs_repair || 0), 0) },
  ];

  // Prepare Vendor Performance Pie Data
  const vendorPerformancePieData = vendorReport.map((v, i) => ({
    name: v.vendor_name || `Vendor ${i + 1}`,
    value: (v.good_condition || 0) + (v.needs_repair || 0)
  }));

  return (
    <>
      <Topbar />
      <Container>
        <main className="p-6">
          {/* Header */}
          <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3" {...fadeInUpProps}>
            <div>
              <h1 className="text-2xl font-bold break-words">{item.name || item.asset_name || "Unnamed Asset"}</h1>
              <p className="text-sm text-muted">UID: {item.uid} • Vendor: {item.vendor_name || "Unknown"}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate(-1)} className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 transition">Back</button>
              <button onClick={() => setEditing(true)} className="px-3 py-2 rounded bg-accent text-black hover:bg-blue-400 transition">Edit</button>
            </div>
          </motion.div>

          {/* Info Cards */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" {...fadeInUpProps} transition={{ delay: 0.1 }}>
            <motion.div className="card hover:shadow-glow transition" {...scaleInProps}>
              <h3 className="font-semibold mb-2">Assembly Status</h3>
              <p className="text-lg">{assemblyRemark?.remark || "—"}</p>
              {assemblyRemark?.reason && <p className="text-sm text-muted mt-2">{assemblyRemark.reason}</p>}
            </motion.div>

            <motion.div className="card hover:shadow-glow transition" {...scaleInProps}>
              <h3 className="font-semibold mb-2">Key Details</h3>
              <p><strong>Condition:</strong> {item.condition_lot || "—"}</p>
              <p><strong>Last Inspection:</strong> {item.last_inspection ? new Date(item.last_inspection).toLocaleDateString() : "—"}</p>
              <p><strong>Warranty Expires:</strong> {item.warranty_expiry ? new Date(item.warranty_expiry).toLocaleDateString() : "N/A"}</p>
              <p><strong>Location:</strong> {item.depot_code || "—"}</p>
              <p><strong>Geo-Coordinates:</strong> {item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : "Not recorded"}</p>
            </motion.div>

            {/* Vendor Context Pie Chart */}
            <PieChartCard title="Vendor Context" data={vendorContextPieData} />
          </motion.div>

          {/* Remarks */}
          <motion.div className="card mt-6" {...fadeInUpProps}>
            <h3 className="font-semibold mb-2">Remarks</h3>
            <p className="text-sm text-muted whitespace-pre-wrap">{item.remarks || "No remarks recorded."}</p>
          </motion.div>

          {/* Vendor Performance Summary */}
          <motion.div className="card mt-8" {...fadeInUpProps}>
            <h2 className="text-xl font-semibold mb-4">Vendor Performance Summary</h2>
            <PieChartCard title="Vendor Performance" data={vendorPerformancePieData} />

            {/* Vendor Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-4 py-2 text-left">Vendor Name</th>
                    <th className="px-4 py-2 text-left">Total Assets Supplied</th>
                    <th className="px-4 py-2 text-left">Good Condition</th>
                    <th className="px-4 py-2 text-left">Needs Repair</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorReport.map((vendor, i) => (
                    <tr key={i} className="border-b border-slate-700 hover:bg-slate-800/40">
                      <td className="px-4 py-2">{vendor.vendor_name}</td>
                      <td className="px-4 py-2">{vendor.total_assets}</td>
                      <td className="px-4 py-2">{vendor.good_condition}</td>
                      <td className="px-4 py-2">{vendor.needs_repair || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Inventory Overview */}
          <motion.div className="card mt-8" {...fadeInUpProps}>
            <h2 className="text-xl font-semibold mb-4">Inventory Overview by Asset Type</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-4 py-2 text-left">Asset Type</th>
                    <th className="px-4 py-2 text-left">Total Units</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.map((asset, i) => (
                    <tr key={i} className="border-b border-slate-700 hover:bg-slate-800/40">
                      <td className="px-4 py-2">{asset.asset_type}</td>
                      <td className="px-4 py-2">{asset.total_units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </Container>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.2 }}>
              <EditAssetModal item={item} onClose={() => setEditing(false)} onSaved={handleSave} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
