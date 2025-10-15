import React from 'react';
import Topbar from '../components/Topbar';
import Container from '../components/Container';
import useFetch from '../hooks/useFetch';

export default function Reports() {
  const { data: vendors, loading: vendorsLoading } = useFetch('/vendors');
  const { data: inventory, loading: inventoryLoading } = useFetch('/inventory');

  return (
    <>
      <Topbar />
      <Container>
        <main className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">Reports</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold mb-3">Vendor Report</h3>
              <div className="overflow-auto">
                {vendorsLoading ? <p className="text-muted">Loading...</p> : (
                  <table className="w-full">
                    <thead className="text-sm text-muted text-left">
                      <tr>
                        <th className="px-3 py-2 border-b border-slate-800">Vendor</th>
                        <th className="px-3 py-2 border-b border-slate-800">Total</th>
                        <th className="px-3 py-2 border-b border-slate-800">Good</th>
                        <th className="px-3 py-2 border-b border-slate-800">Needs Repair</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors?.map(v => (
                        <tr key={v.vendor_name} className="border-t border-slate-800">
                          <td className="px-3 py-2">{v.vendor_name}</td>
                          <td className="px-3 py-2">{v.total_assets}</td>
                          <td className="px-3 py-2">{v.good_condition}</td>
                          <td className="px-3 py-2">{v.needs_repair}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">Inventory Report</h3>
              <div className="overflow-auto">
                {inventoryLoading ? <p className="text-muted">Loading...</p> : (
                  <table className="w-full">
                    <thead className="text-sm text-muted text-left">
                      <tr>
                        <th className="px-3 py-2 border-b border-slate-800">Asset Type</th>
                        <th className="px-3 py-2 border-b border-slate-800">Total Units</th>
                        <th className="px-3 py-2 border-b border-slate-800">Avg. Warranty (Days)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory?.map(i => (
                        <tr key={i.asset_type} className="border-t border-slate-800">
                          <td className="px-3 py-2">{i.asset_type}</td>
                          <td className="px-3 py-2">{i.total_units}</td>
                          <td className="px-3 py-2">{Math.round(i.avg_days_left_warranty ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </Container>
    </>
  );
}