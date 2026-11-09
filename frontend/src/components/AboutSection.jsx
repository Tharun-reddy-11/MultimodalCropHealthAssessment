import React from 'react';
import { CheckCircle2, ShieldCheck, Sprout, HeartHandshake } from 'lucide-react';

export default function AboutSection({ onRegister }) {
  return (
    <section id="about" style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2.5rem',
          boxShadow: 'var(--shadow-md)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}
      >
        <div>
          <span className="section-tag">BUILT FOR GROWERS</span>
          <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Practical Crop Protection That Puts Farmers First
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Plant diseases like anthracnose, powdery mildew, and bacterial canker can destroy up to 40% of crop yields
            if caught late. AgroVita AI gives growers instant answers so you can take the right action before infections spread.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <CheckCircle2 size={20} color="#1b5e20" />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Identifies 8 critical foliar crop diseases in seconds
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <CheckCircle2 size={20} color="#1b5e20" />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Visual heatmap shows exactly which leaf areas are affected
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <CheckCircle2 size={20} color="#1b5e20" />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Actionable spray, pruning, and greenhouse humidity guidance
              </span>
            </div>
          </div>

          <button
            onClick={onRegister}
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem' }}
          >
            Start Free Farm Check
          </button>
        </div>

        <div
          style={{
            background: 'var(--bg-cream)',
            border: '1.5px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Reduce Spray Waste
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Treat only infected rows and save on pesticide and fungicide expenses.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}
            >
              <Sprout size={26} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Protect Canopy Health
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Improve greenhouse ventilation and microclimate before spores germinate.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}
            >
              <HeartHandshake size={26} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Decision Support for You
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Clear second opinion right in your pocket when you are walking the farm rows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
