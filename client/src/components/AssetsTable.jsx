import React from "react";
import { Link } from "react-router-dom";

export default function AssetsTable({ data = [] }) {
  return (
    <div className="card overflow-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left text-sm text-muted border-b border-slate-800 bg-slate-900/50">
            <th className="px-3 py-2">UID</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Vendor</th>
            <th className="px-3 py-2">Condition</th>
            <th className="px-3 py-2">Warranty</th>
            <th className="px-3 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((a) => (
              <tr
                key={a.uid}
                className="border-t border-slate-800 hover:bg-slate-900 transition-colors"
              >
                <td className="px-3 py-3 text-sm font-mono">{a.uid}</td>
                <td className="px-3 py-3">{a.name || "-"}</td>
                <td className="px-3 py-3">{a.vendor_name || "-"}</td>
                <td className="px-3 py-3">{a.condition_lot || "-"}</td>
                <td className="px-3 py-3">
                  {a.warranty_expiry
                    ? new Date(a.warranty_expiry).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="px-3 py-3 text-center">
                  <Link
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-accent hover:text-black text-sm font-medium"
                    to={`/asset/${encodeURIComponent(a.uid)}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-6 text-center text-muted">
                No assets found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
