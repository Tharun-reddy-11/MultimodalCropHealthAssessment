import React from 'react';
import { Sprout } from 'lucide-react';

export default function Navbar({ onNavigate }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="navbar">
      <div className="brand" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
        <img
          src="/logo.png"
          alt="AgroVita AI Logo"
          style={{
            width: '44px',
            height: '44px',
            objectFit: 'contain'
          }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1.1 }}>
            <span style={{ color: 'var(--primary-dark)', fontWeight: 800 }}>AgroVita</span>
            <span style={{ color: 'var(--primary-light)', fontWeight: 800 }}>AI</span>
          </div>
          <span className="brand-tagline">Grow Smarter · Detect Earlier · Harvest Better</span>
        </div>
      </div>

      <nav className="nav-links">
        <button className="nav-link" onClick={() => scrollTo('hero')}>Home</button>
        <button className="nav-link" onClick={() => scrollTo('features')}>Features</button>
        <button className="nav-link" onClick={() => scrollTo('how-it-works')}>How It Works</button>
        <button className="nav-link" onClick={() => scrollTo('about')}>About</button>
      </nav>

      <div className="nav-actions">
        <button
          onClick={() => onNavigate('login')}
          className="btn-secondary"
          style={{ padding: '8px 18px', fontSize: '0.9rem' }}
        >
          Sign In
        </button>
        <button
          onClick={() => onNavigate('register')}
          className="btn-primary"
          style={{ padding: '8px 20px', fontSize: '0.9rem' }}
        >
          Check My Crop
        </button>
      </div>
    </header>
  );
}
