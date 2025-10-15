import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Container from '../components/Container';
import useFetch from '../hooks/useFetch';
import EditAssetModal from '../components/EditAssetModal';

export default function AssetDetail() {
  const { uid } = useParams();
  const [dataKey, setDataKey] = useState(0); 
  const { data, loading, error } = useFetch(`/assets/${encodeURIComponent(uid)}`, [uid, dataKey]);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const handleSave = (updatedItem) => {
    setEditing(false);
    setDataKey(prev => prev + 1);
  };

  if (loading) return (
    <>
      <Topbar />
      <Container><div className="p-6 card text-center">Loading asset details...</div></Container>
    </>
  );

  if (error || !data || !data.item) return (
    <>
      <Topbar />
      <Container><div className="p-6 card text-center text-red-400">Error: Asset not found or failed to load.</div></Container>
    </>
  );

  const { item, assemblyRemark, vendorReport } = data;

  return (
    <>
      <Topbar />
      <Container>
        <main className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{item.name || item.uid}</h1>
              <div className="text-sm text-muted">UID: {item.uid} • Vendor: {item.vendor_name}</div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700">Back</button>
              <button onClick={() => setEditing(true)} className="px-3 py-2 rounded bg-accent text-black hover:bg-blue-400">Edit</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <h3 className="font-semibold mb-2">Assembly Status</h3>
              <div className="text-lg">{assemblyRemark?.remark}</div>
              <div className="text-sm text-muted mt-2">{assemblyRemark?.reason}</div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-2">Key Details</h3>
              <p><strong>Condition:</strong> {item.condition_lot || '—'}</p>
              <p><strong>Last Inspection:</strong> {item.last_inspection ? new Date(item.last_inspection).toLocaleDateString() : '—'}</p>
              <p><strong>Warranty Expires:</strong> {item.warranty_expiry ? new Date(item.warranty_expiry).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Location:</strong> {item.depot_code || '—'}</p>
              <p><strong>Geo-Coordinates:</strong> {item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : 'Not recorded'}</p>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-2">Vendor Context</h3>
              <p><strong>Total Assets from Vendor:</strong> {vendorReport?.total_assets ?? '—'}</p>
              <p><strong>Good Condition:</strong> {vendorReport?.good_condition ?? '—'}</p>
              <p><strong>Needs Repair:</strong> {vendorReport?.needs_repair ?? '—'}</p>
            </div>
          </div>

          <div className="card mt-6">
            <h3 className="font-semibold mb-2">Remarks</h3>
            <p className="text-sm text-muted whitespace-pre-wrap">{item.remarks || 'No remarks recorded.'}</p>
          </div>
        </main>
      </Container>

      {editing && <EditAssetModal item={item} onClose={() => setEditing(false)} onSaved={handleSave} />}
    </>
  );
}
