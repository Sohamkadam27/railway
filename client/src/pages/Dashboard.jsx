import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Container from '../components/Container';
import StatCard from '../components/StatCard';
import AssetCard from '../components/AssetCard';
import AssetsTable from '../components/AssetsTable';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashData, setDashData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loadingDash, setLoadingDash] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [error, setError] = useState('');

  // Check authentication on mount
  useEffect(() => {
    if (!localStorage.getItem('auth')) navigate('/login');
  }, [navigate]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoadingDash(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:3000/api/dashboard', { withCredentials: true });
        setDashData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('auth');
          navigate('/login');
        } else {
          setError('Failed to load dashboard data.');
        }
      } finally {
        setLoadingDash(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  // Fetch assets
  useEffect(() => {
    const fetchAssets = async () => {
      setLoadingAssets(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:3000/api/assets', { withCredentials: true });
        setAssets(res.data || []);
      } catch (err) {
        console.error('Error fetching assets:', err);
        setError('Failed to load assets.');
      } finally {
        setLoadingAssets(false);
      }
    };
    fetchAssets();
  }, []);

  const latestAssets = assets.slice(0, 4);
  const assetsSnapshot = assets.slice(0, 5);

  return (
    <>
      <Topbar />
      <Container>
        <main className="p-6 space-y-6">
          {error && (
            <div className="text-red-400 bg-red-950/50 p-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          {/* Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Total Assets" value={loadingDash ? '...' : dashData?.total ?? '—'} subtitle="Total tracked units" />
            <StatCard title="Good Condition" value={loadingDash ? '...' : dashData?.good ?? '—'} subtitle="Ready for service" />
            <StatCard title="Expiring (30d)" value={loadingDash ? '...' : dashData?.soonExpiring ?? '—'} subtitle="Warranty ending soon" />
          </section>

          {/* Latest Assets Section */}
          <section className="card">
            <h3 className="text-lg font-semibold mb-4">Latest Assets</h3>
            {loadingAssets ? (
              <p className="text-gray-400">Loading...</p>
            ) : latestAssets.length === 0 ? (
              <p className="text-gray-400">No assets found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {latestAssets.map((asset) => (
                  <AssetCard
                    key={asset.uid}
                    item={asset}
                    onView={() => navigate(`/asset/${encodeURIComponent(asset.uid)}`)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Assets Snapshot Table */}
          <section className="card">
            <h3 className="font-semibold mb-3">Assets Snapshot</h3>
            <div className="overflow-auto">
              {loadingAssets ? (
                <p className="text-gray-400">Loading...</p>
              ) : assetsSnapshot.length === 0 ? (
                <p className="text-gray-400">No assets to display</p>
              ) : (
                <AssetsTable data={assetsSnapshot} />
              )}
            </div>
          </section>
        </main>
      </Container>
    </>
  );
}
