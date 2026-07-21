'use client';

import { useEffect, useState } from 'react';
import type { Cenik } from '@/lib/content';
import { buttonStyle, cardStyle, labelStyle, inputStyle } from './styles';

export default function PricingAdmin() {
  const [cenik, setCenik] = useState<Cenik | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then((res) => res.json())
      .then(setCenik);
  }, []);

  async function save() {
    if (!cenik) return;
    setStatus('Ukládám…');
    const res = await fetch('/api/admin/pricing', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(cenik),
    });
    setStatus(res.ok ? 'Uloženo.' : 'Uložení se nepovedlo.');
  }

  if (!cenik) return <p>Načítám…</p>;

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Ceník</h2>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
        Upravujte pouze částky. Ostatní údaje (velikosti, názvy) se editují jinde.
      </p>

      <div style={{ ...cardStyle, marginBottom: '1rem' }}>
        <strong>Med</strong>
        {cenik.honey.map((row, i) => (
          <label key={row.size} style={labelStyle}>
            {row.size} ({row.unit})
            <input
              type="number"
              style={inputStyle}
              value={row.price}
              onChange={(e) => {
                const price = Number(e.target.value);
                setCenik({
                  ...cenik,
                  honey: cenik.honey.map((r, idx) => (idx === i ? { ...r, price } : r)),
                });
              }}
            />
          </label>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: '1rem' }}>
        <strong>Propolisové produkty</strong>
        {cenik.propolis.map((row, i) => (
          <label key={row.name} style={labelStyle}>
            {row.name} ({row.size})
            <input
              type="number"
              style={inputStyle}
              value={row.price}
              onChange={(e) => {
                const price = Number(e.target.value);
                setCenik({
                  ...cenik,
                  propolis: cenik.propolis.map((r, idx) => (idx === i ? { ...r, price } : r)),
                });
              }}
            />
          </label>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: '1rem' }}>
        <strong>Dárková balení</strong>
        {cenik.giftSets.map((row, i) => (
          <label key={row.name} style={labelStyle}>
            {row.name}
            <input
              type="number"
              style={inputStyle}
              value={row.price}
              onChange={(e) => {
                const price = Number(e.target.value);
                setCenik({
                  ...cenik,
                  giftSets: cenik.giftSets.map((r, idx) => (idx === i ? { ...r, price } : r)),
                });
              }}
            />
          </label>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: '1rem' }}>
        <strong>Záloha na sklenici</strong>
        <label style={labelStyle}>
          Výše zálohy ({cenik.jarDeposit.currency})
          <input
            type="number"
            style={inputStyle}
            value={cenik.jarDeposit.amount}
            onChange={(e) =>
              setCenik({ ...cenik, jarDeposit: { ...cenik.jarDeposit, amount: Number(e.target.value) } })
            }
          />
        </label>
      </div>

      <button onClick={save} style={buttonStyle}>
        Uložit ceník
      </button>
      {status && <p style={{ marginTop: '0.5rem' }}>{status}</p>}
    </div>
  );
}
