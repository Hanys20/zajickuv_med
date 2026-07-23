'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { inputStyle } from './styles';

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b675f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );
}

export default function PasswordInput({
  value,
  onChange,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete'];
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={visible ? 'text' : 'password'}
        style={{ ...inputStyle, paddingRight: '2.5rem' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Skrýt heslo' : 'Zobrazit heslo'}
        style={{
          position: 'absolute',
          right: '0.6rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}
