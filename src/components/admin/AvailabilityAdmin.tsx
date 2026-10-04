'use client';

import { useEffect, useState } from 'react';
import { buttonStyle, cardStyle } from './styles';

type Row = { slug: string; name: string; availability: 'available' | 'sold-out' };

export default function AvailabilityAdmin() {
  const [items, setItems] = useState<Row[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  function load() {
    fetch('/api/admin/availability', { cache: 'no-store' })
      .then((res) => res.json())
      .then(setItems);
  }

  useEffect(load, []);

  async function toggle(row: Row) {
    const next = row.availability === 'available' ? 'sold-out' : 'available';
    const previous = row.availability;
    setItems((current) =>
      current ? current.map((r) => (r.slug === row.slug ? { ...r, availability: next } : r)) : current
    );
    const res = await fetch(`/api/admin/availability/${row.slug}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ availability: next }),
    });
    if (!res.ok) {
      setItems((current) =>
        current
          ? current.map((r) => (r.slug === row.slug ? { ...r, availability: previous } : r))
          : current
      );
    }
    setStatus(res.ok ? 'Uloženo.' : 'Uložení se nepovedlo.');
  }

  if (!items) return <p>Načítám…</p>;

  const honeys = items.filter((row) => row.slug.startsWith('med-'));
  const otherProducts = items.filter((row) => !row.slug.startsWith('med-'));

  function renderItems(rows: Row[]) {
    return (
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {rows.map((row) => (
          <li
            key={row.slug}
            style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
          >
            <span style={{ fontWeight: 600 }}>{row.name}</span>
            <button
              onClick={() => toggle(row)}
              style={{
                ...buttonStyle,
                flexShrink: 0,
                background: row.availability === 'available' ? '#c8e6c9' : '#e0e0e0',
              }}
            >
              {row.availability === 'available' ? 'Skladem' : 'Vyprodáno'}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Dostupnost</h2>
      {status && <p style={{ marginBottom: '0.75rem' }}>{status}</p>}
      <section>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1rem 0 0.6rem' }}>Medy</h3>
        {renderItems(honeys)}
      </section>
      <section>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1.5rem 0 0.6rem' }}>
          Ostatní produkty
        </h3>
        {renderItems(otherProducts)}
      </section>
    </div>
  );
}
