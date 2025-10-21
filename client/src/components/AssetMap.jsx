import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

export default function AssetMap() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGeoAssets = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/assets/geo", {
          withCredentials: true,
        });
        setAssets(res.data || []);
      } catch (err) {
        console.error("Failed to load geo assets:", err);
        setError("Could not load asset map data.");
      } finally {
        setLoading(false);
      }
    };
    fetchGeoAssets();
  }, []);

  if (loading)
    return (
      <div className="p-4 text-center text-muted">Loading map data...</div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-400">
        ⚠️ {error}
      </div>
    );

  if (!assets.length)
    return (
      <div className="p-4 text-center text-muted">
        No geo-tagged assets found.
      </div>
    );

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: "500px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {assets.map(
        (asset) =>
          asset.latitude &&
          asset.longitude && (
            <Marker key={asset.uid} position={[asset.latitude, asset.longitude]}>
              <Popup>
                <div className="text-sm">
                  <strong>{asset.asset_type || "Unknown Type"}</strong>
                  <br />
                  UID: {asset.uid}
                  <br />
                  Vendor: {asset.vendor_name || "N/A"}
                  <br />
                  Condition: {asset.condition_lot || "Unknown"}
                  <br />
                  Depot: {asset.depot_code || "N/A"}
                </div>
              </Popup>
            </Marker>
          )
      )}
    </MapContainer>
  );
}
