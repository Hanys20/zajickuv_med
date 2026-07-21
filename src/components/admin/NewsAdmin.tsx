'use client';

import { useEffect, useState } from 'react';
import {
  buttonStyle,
  secondaryButtonStyle,
  dangerButtonStyle,
  cardStyle,
  labelStyle,
  inputStyle,
} from './styles';

type NewsRow = { id: number; title: string; date: string; body: string };

function toDateInputValue(iso: string) {
  return iso.slice(0, 10);
}

export default function NewsAdmin() {
  const [items, setItems] = useState<NewsRow[] | null>(null);
  const [editing, setEditing] = useState<NewsRow | { id: null; title: string; date: string; body: string } | null>(
    null
  );
  const [status, setStatus] = useState<string | null>(null);

  function load() {
    fetch('/api/admin/news')
      .then((res) => res.json())
      .then(setItems);
  }

  useEffect(load, []);

  function startNew() {
    setEditing({ id: null, title: '', date: new Date().toISOString().slice(0, 10), body: '' });
  }

  async function save() {
    if (!editing) return;
    setStatus('Ukládám…');
    const payload = {
      title: editing.title,
      date: new Date(editing.date).toISOString(),
      body: editing.body,
    };
    const res = await fetch(editing.id ? `/api/admin/news/${editing.id}` : '/api/admin/news', {
      method: editing.id ? 'PUT' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setStatus('Uloženo.');
      setEditing(null);
      load();
    } else {
      setStatus('Uložení se nepovedlo.');
    }
  }

  async function remove(id: number) {
    if (!confirm('Opravdu smazat tuto aktualitu?')) return;
    await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
    load();
  }

  if (!items) return <p>Načítám…</p>;

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Aktuality</h2>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
        Na webu se vždy zobrazuje aktualita s nejnovějším datem.
      </p>

      {!editing && (
        <button onClick={startNew} style={buttonStyle}>
          + Nová aktualita
        </button>
      )}

      {editing && (
        <div style={cardStyle}>
          <label style={labelStyle}>
            Název
            <input
              style={inputStyle}
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
          </label>
          <label style={labelStyle}>
            Datum
            <input
              type="date"
              style={inputStyle}
              value={
                editing.id
                  ? toDateInputValue(editing.date)
                  : editing.date.length === 10
                    ? editing.date
                    : toDateInputValue(editing.date)
              }
              onChange={(e) => setEditing({ ...editing, date: e.target.value })}
            />
          </label>
          <label style={labelStyle}>
            Text zprávy
            <textarea
              style={{ ...inputStyle, minHeight: 140 }}
              value={editing.body}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            />
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button onClick={save} style={buttonStyle}>
              Uložit
            </button>
            <button onClick={() => setEditing(null)} style={secondaryButtonStyle}>
              Zrušit
            </button>
          </div>
        </div>
      )}

      {status && <p style={{ marginTop: '0.5rem' }}>{status}</p>}

      <ul style={{ marginTop: '1.5rem', listStyle: 'none', padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ ...cardStyle, marginBottom: '0.75rem' }}>
            <strong>{item.title}</strong>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              {new Date(item.date).toLocaleDateString('cs-CZ')}
            </div>
            <p style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{item.body}</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setEditing(item)} style={secondaryButtonStyle}>
                Upravit
              </button>
              <button onClick={() => remove(item.id)} style={dangerButtonStyle}>
                Smazat
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
