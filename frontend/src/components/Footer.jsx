import React from 'react';
import { Sprout } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1.5px solid var(--border-light)', padding: '3.5rem 2rem 2rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
            <img
              src="/logo.png"
              alt="AgroVita AI Logo"
              style={{ width: '36px', height: '36px', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              AgroVita <span style={{ color: 'var(--primary-light)' }}>AI</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Grow Smarter. Detect Earlier. Harvest Better.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.8rem', alignItems: 'center' }}>
          <button onClick={() => onNavigate('landing')} style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
            Home
          </button>
          <button onClick={() => onNavigate('login')} style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
            Sign In
          </button>
          <button onClick={() => onNavigate('register')} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
            Check My Crop
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto 0 auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        © 2026 AgroVita AI — Dedicated to Farmers & Greenhouse Cultivators. Built for Agricultural Health & Safety.
      </div>
    </footer>
  );
}
