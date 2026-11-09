import React, { useState, useEffect, useRef } from 'react';
import {
  PlusCircle,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export default function OverviewView({ user, onNavigateTab, onSelectAssessment }) {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    healthyCount: 0,
    diseasedCount: 0,
    recentAssessments: []
  });
  const [loading, setLoading] = useState(true);

  // Auto-playing Workflow Guide Carousel (5-second interval)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const CAROUSEL_SLIDES = [
    {
      step: 'Step 1 of 4',
      title: 'Capture Foliage & Climate',
      desc: 'Take a clear leaf photo on your smartphone and log greenhouse temperature, humidity, and weather conditions.',
      image: '/cards/step_1.png'
    },
    {
      step: 'Step 2 of 4',
      title: 'Multimodal AI Fusion',
      desc: 'Deep CNN processes leaf lesion patterns while MLP neural network fuses real-time microclimate sensor telemetry.',
      image: '/cards/step_2.png'
    },
    {
      step: 'Step 3 of 4',
      title: 'Grad-CAM Disease Map',
      desc: 'Receive instant disease classification with explainable visual Grad-CAM heatmaps showing exact lesion zones.',
      image: '/cards/step_3.png'
    },
    {
      step: 'Step 4 of 4',
      title: 'Targeted Care & Monitoring',
      desc: 'Access immediate protective treatment advice, spray recommendations, and track crop recovery over time.',
      image: '/cards/step_4.png'
    }
  ];

  // Auto-advance slides every 5 seconds (pauses on hover)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered, CAROUSEL_SLIDES.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('crop_health_token');
      const res = await fetch('/api/analytics/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load dashboard overview data.');
      const data = await res.json();
      setStats({
        totalAssessments: data.totalAssessments || 0,
        healthyCount: data.healthyCount || 0,
        diseasedCount: data.diseasedCount || 0,
        recentAssessments: data.recentAssessments || []
      });
    } catch (err) {
      console.warn('Overview fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const healthRate = stats.totalAssessments > 0
    ? Math.round((stats.healthyCount / stats.totalAssessments) * 100)
    : 100;

  const slide = CAROUSEL_SLIDES[currentSlide];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 4-Step Auto-Playing Workflow Carousel Moved to Top (5-Second Interval) */}
      <div
        className="guide-carousel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ marginBottom: 0 }}
      >
        <button className="carousel-arrow prev" onClick={prevSlide} title="Previous Step">
          <ChevronLeft size={20} />
        </button>
        <button className="carousel-arrow next" onClick={nextSlide} title="Next Step">
          <ChevronRight size={20} />
        </button>

        <div className="carousel-slide">
          <img
            src={slide.image}
            alt={slide.title}
            className="carousel-img"
            onError={(e) => {
              e.target.src = `/images/carousel/slide_${currentSlide + 1}.png`;
            }}
          />
          <div className="carousel-text">
            <span className="carousel-step-badge">{slide.step}</span>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
              {slide.title}
            </h3>
            <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {slide.desc}
            </p>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="carousel-dots">
          {CAROUSEL_SLIDES.map((_, idx) => (
            <div
              key={idx}
              className={`carousel-dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </div>

      {/* Farmer KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
        <div className="farmer-card" style={{ padding: '1.4rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Total Crops Checked
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
            {stats.totalAssessments}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Foliage observations recorded
          </div>
        </div>

        <div className="farmer-card" style={{ padding: '1.4rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Healthy Crops
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#16a34a' }}>
            {stats.healthyCount}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#16a34a', marginTop: '0.4rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> {healthRate}% healthy ratio
          </div>
        </div>

        <div className="farmer-card" style={{ padding: '1.4rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Needs Treatment (Sick)
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: stats.diseasedCount > 0 ? '#dc2626' : 'var(--text-primary)' }}>
            {stats.diseasedCount}
          </div>
          <div style={{ fontSize: '0.82rem', color: stats.diseasedCount > 0 ? '#dc2626' : 'var(--text-secondary)', marginTop: '0.4rem', fontWeight: 500 }}>
            {stats.diseasedCount > 0 ? 'Foliar treatment advised' : 'No infected plants'}
          </div>
        </div>

        <div className="farmer-card" style={{ padding: '1.4rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Overall Farm Health
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--primary)' }}>
            {healthRate}%
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} color="#1b5e20" /> Based on your checks
          </div>
        </div>
      </div>

      {/* Recent Observations */}
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.6rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Crop Checks
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Click any check to see the damage highlight map and treatment steps
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {stats.recentAssessments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              No Crop Checks Yet
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.2rem' }}>
              Upload your first leaf photo to check for plant diseases.
            </p>
            <button
              onClick={() => onNavigateTab('new-assessment')}
              className="btn-primary"
              style={{ padding: '10px 22px' }}
            >
              Check My Crop Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {stats.recentAssessments.map((item) => {
              const isHealthy = item.prediction?.toLowerCase().includes('healthy');
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectAssessment) onSelectAssessment(item);
                    onNavigateTab('prediction-results');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.9rem 1.2rem',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.background = 'var(--primary-soft)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.background = 'var(--bg-main)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={`/api/assessments/${item.id}/image`}
                      alt="Leaf"
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid var(--border-light)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.96rem' }}>
                        {item.plantId || `Crop Check #${item.id.slice(0, 8)}`}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {item.cropType} · {item.observationDate}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: isHealthy ? '#dcfce7' : '#fee2e2',
                        color: isHealthy ? '#15803d' : '#b91c1c',
                        border: `1px solid ${isHealthy ? '#bbf7d0' : '#fecaca'}`
                      }}
                    >
                      {item.prediction || 'Checked'}
                    </span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                      View Care Advice →
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
