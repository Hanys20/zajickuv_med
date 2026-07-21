'use client';

import { useEffect, useState } from 'react';
import NewsAdmin from '@/components/admin/NewsAdmin';
import AvailabilityAdmin from '@/components/admin/AvailabilityAdmin';
import PricingAdmin from '@/components/admin/PricingAdmin';
import { buttonStyle, secondaryButtonStyle, inputStyle, labelStyle } from '@/components/admin/styles';

type Tab = 'news' | 'availability' | 'pricing';

function LoginForm({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      onLoggedIn();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? 'Přihlášení se nepovedlo.');
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 340, margin: '4rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Přihlášení do správy webu</h1>
      <label style={labelStyle}>
        Uživatelské jméno
        <input style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
      </label>
      <label style={labelStyle}>
        Heslo
        <input
          type="password"
          style={inputStyle}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && <p style={{ color: '#b00020', marginBottom: '0.75rem' }}>{error}</p>}
      <button type="submit" style={{ ...buttonStyle, width: '100%' }} disabled={loading}>
        {loading ? 'Přihlašuji…' : 'Přihlásit se'}
      </button>
    </form>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('news');

  function checkAuth() {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data: { authenticated: boolean }) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false));
  }

  useEffect(checkAuth, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthenticated(false);
  }

  if (authenticated === null) {
    return <p style={{ padding: '2rem' }}>Načítám…</p>;
  }

  if (!authenticated) {
    return <LoginForm onLoggedIn={checkAuth} />;
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Správa webu — Zajíčkův med</h1>
        <button onClick={logout} style={secondaryButtonStyle}>
          Odhlásit se
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setTab('news')} style={tab === 'news' ? buttonStyle : secondaryButtonStyle}>
          Aktuality
        </button>
        <button
          onClick={() => setTab('availability')}
          style={tab === 'availability' ? buttonStyle : secondaryButtonStyle}
        >
          Dostupnost medů
        </button>
        <button onClick={() => setTab('pricing')} style={tab === 'pricing' ? buttonStyle : secondaryButtonStyle}>
          Ceník
        </button>
      </div>

      {tab === 'news' && <NewsAdmin />}
      {tab === 'availability' && <AvailabilityAdmin />}
      {tab === 'pricing' && <PricingAdmin />}
    </div>
  );
}
