import type { CSSProperties } from 'react';

export const buttonStyle: CSSProperties = {
  background: '#d9a441',
  color: '#1a1a1a',
  border: 'none',
  borderRadius: 8,
  padding: '0.6rem 1.1rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '0.95rem',
};

export const secondaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: '#eee',
};

export const dangerButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: '#f3d4d4',
};

export const cardStyle: CSSProperties = {
  border: '1px solid #e2d4b8',
  borderRadius: 10,
  padding: '1rem',
  background: '#fffaf0',
};

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  marginBottom: '0.75rem',
};

export const inputStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: '0.25rem',
  padding: '0.5rem',
  fontSize: '1rem',
  border: '1px solid #ccc',
  borderRadius: 6,
  boxSizing: 'border-box',
};
