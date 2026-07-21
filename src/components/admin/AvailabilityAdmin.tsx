'use client';

import { useEffect, useState } from 'react';
import { buttonStyle, cardStyle } from './styles';

type Row = { slug: string; name: string; availability: 'available' | 'sold-out' };

export default function AvailabilityAdmin() {
  const [items, setItems] = useState<Row[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  function load() {
    fetch('/api/admin/availability')
      .then((res) => res.json())
      .then(setItems);
  }

  useEffect(load, []);

  async function toggle(row: Row) {
    const next = row.availability === 'available' ? 'sold-out' : 'available';
    setItems((current) =>
      current ? current.map((r) => (r.slug === row.slug ? { ...r, availability: next } : r)) : current
    );
    const res = await fetch(`/api/admin/availability/${row.slug}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ availability: next }),
    });
    setStatus(res.ok ? 'Uloženo.' : 'Uložení se nepovedlo.');
  }

  if (!items) return <p>Načítám…</p>;

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Dostupnost medů</h2>
      {status && <p style={{ marginBottom: '0.75rem' }}>{status}</p>}
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {items.map((row) => (
          <li
            key={row.slug}
            style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span style={{ fontWeight: 600 }}>{row.name}</span>
            <button
              onClick={() => toggle(row)}
              style={{
                ...buttonStyle,
                background: row.availability === 'available' ? '#c8e6c9' : '#e0e0e0',
              }}
            >
              {row.availability === 'available' ? 'Skladem' : 'Vyprodáno'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
