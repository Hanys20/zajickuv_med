'use client';

import { useState } from 'react';
import PasswordInput from './PasswordInput';
import { buttonStyle, cardStyle, labelStyle } from './styles';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (newPassword.length < 8) {
      setStatus({ type: 'error', text: 'Nové heslo musí mít alespoň 8 znaků.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', text: 'Nová hesla se neshodují.' });
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setLoading(false);

    if (res.ok) {
      setStatus({ type: 'success', text: 'Heslo bylo změněno.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      const data = await res.json().catch(() => null);
      setStatus({ type: 'error', text: data?.error ?? 'Změna hesla se nepovedla.' });
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Změna hesla</h2>
      <form onSubmit={submit} style={{ ...cardStyle, maxWidth: 360 }}>
        <label style={labelStyle}>
          Současné heslo
          <PasswordInput value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
        </label>
        <label style={labelStyle}>
          Nové heslo
          <PasswordInput value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
        </label>
        <label style={labelStyle}>
          Nové heslo znovu
          <PasswordInput value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
        </label>

        {status && (
          <p style={{ marginBottom: '0.75rem', color: status.type === 'error' ? '#b00020' : '#2e7d32' }}>
            {status.text}
          </p>
        )}

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Ukládám…' : 'Změnit heslo'}
        </button>
      </form>
    </div>
  );
}
