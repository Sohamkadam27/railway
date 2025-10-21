// client/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Container from "../components/Container";
import StatCard from "../components/StatCard";
import AssetCard from "../components/AssetCard";
import AssetsTable from "../components/AssetsTable";
import TrackFittingCalculator from "../components/TrackFittingCalculator";
import useFetch from "../hooks/useFetch";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCalculator, setShowCalculator] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (!auth) navigate("/login");
  }, [navigate]);

  // Fetch dashboard summary and assets list
  const {
    data: dashData,
    loading: loadingDash,
    error: dashError,
    refetch: refetchDash,
  } = useFetch("/dashboard", []);

  const {
    data: assetsData,
    loading: loadingAssets,
    error: assetsError,
    refetch: refetchAssets,
  } = useFetch("/assets", []);

  const error = dashError || assetsError;
  const assets = Array.isArray(assetsData) ? assetsData : [];
  const latestAssets = assets.slice(0, 4);
  const assetsSnapshot = assets.slice(0, 5);

  return (
    <>
      <Topbar />
      <Container>
        <main className="p-6 space-y-6 text-white">
          {/* Error Display */}
          {error && (
            <div className="text-red-400 bg-red-950/50 p-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowCalculator(true)}
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-black font-semibold"
            >
              Calculate Fittings
            </button>
          </div>

          {/* Dashboard Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Assets"
              value={loadingDash ? "..." : dashData?.total ?? "—"}
              subtitle="Total tracked units"
            />
            <StatCard
              title="Good Condition"
              value={loadingDash ? "..." : dashData?.good ?? "—"}
              subtitle="Ready for service"
            />
            <StatCard
              title="Expiring (30d)"
              value={loadingDash ? "..." : dashData?.soonExpiring ?? "—"}
              subtitle="Warranty ending soon"
            />
          </section>

          {/* Latest Assets Section */}
          <section className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Latest Assets</h3>
              <button
                onClick={refetchAssets}
                className="text-sm bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded"
              >
                Refresh
              </button>
            </div>

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
                    onView={() =>
                      navigate(`/asset/${encodeURIComponent(asset.uid)}`)
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* Assets Snapshot Table */}
          <section className="card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Assets Snapshot</h3>
              <button
                onClick={refetchAssets}
                className="text-sm bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded"
              >
                Refresh
              </button>
            </div>

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

      {/* Track Fitting Calculator Modal */}
      {showCalculator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCalculator(false)}
        >
          <div
            className="relative w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <TrackFittingCalculator onClose={() => setShowCalculator(false)} />
          </div>
        </div>
      )}
    </>
  );
}
