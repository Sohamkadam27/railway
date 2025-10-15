import React, { useState, useMemo } from 'react';
import Topbar from '../components/Topbar';
import Container from '../components/Container';
import useFetch from '../hooks/useFetch';
import AssetsTable from '../components/AssetsTable';

export default function Assets() {
  const [query, setQuery] = useState('');
  const { data: assets, loading } = useFetch('/assets');

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    if (!query) return assets;
    const lowerCaseQuery = query.toLowerCase();
    return assets.filter(a =>
      (a.uid && a.uid.toLowerCase().includes(lowerCaseQuery)) ||
      (a.name && a.name.toLowerCase().includes(lowerCaseQuery)) ||
      (a.vendor_name && a.vendor_name.toLowerCase().includes(lowerCaseQuery))
    );
  }, [assets, query]);

  return (
    <>
      <Topbar onSearch={setQuery} />
      <Container>
        <main className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Assets</h2>
          {loading && <div className="card p-4 text-center text-muted">Loading assets...</div>}
          {!loading && <AssetsTable data={filteredAssets} />}
        </main>
      </Container>
    </>
  );
}