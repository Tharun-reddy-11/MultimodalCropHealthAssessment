import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function VideoHero({ onStartAssessment, onExploreFeatures }) {
  return (
    <section id="hero" className="hero">
      {/* Moving Motion Background Image (5s Zoom In / Zoom Out) */}
      <div className="hero-motion-bg-wrap">
        <img
          src="/images/landing_hero_bg.png"
          alt="Multimodal Crop Health Assessment"
          className="hero-motion-bg"
        />
      </div>

      <div className="hero-overlay" />

      <div className="hero-content">
        <h1 className="hero-title">
          Grow Smarter.<br />
          <em>Detect Earlier. Harvest Better.</em>
        </h1>

        <p className="hero-subtitle">
          Instantly check if your crop is healthy, spot foliar diseases before they spread,
          and get clear treatment advice designed specifically for farmers and greenhouse growers.
        </p>

        <div className="hero-cta">
          <button
            onClick={onStartAssessment}
            className="btn-primary"
            style={{ padding: '14px 34px', fontSize: '1.05rem', gap: '10px' }}
          >
            <span>Check My Crop Health</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onExploreFeatures}
            className="btn-secondary"
            style={{
              padding: '13px 28px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.95)'
            }}
          >
            See How It Works
          </button>
        </div>
      </div>
    </section>
  );
}
