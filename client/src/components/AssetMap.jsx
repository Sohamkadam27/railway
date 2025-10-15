import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

export default function AssetMap() {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const fetchGeoAssets = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/assets/geo', { withCredentials: true });
        setAssets(res.data);
      } catch (err) {
        console.error('Failed to load geo assets:', err);
      }
    };
    fetchGeoAssets();
  }, []);

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {assets.map(asset => (
        asset.latitude && asset.longitude && (
          <Marker key={asset.uid} position={[asset.latitude, asset.longitude]}>
            <Popup>
              <div>
                <strong>{asset.asset_type}</strong><br/>
                UID: {asset.uid}<br/>
                Vendor: {asset.vendor_name}<br/>
                Condition: {asset.condition_lot}<br/>
                Depot: {asset.depot_code}
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}
