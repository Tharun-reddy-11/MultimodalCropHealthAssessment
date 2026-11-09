import React, { useState } from 'react';
import {
  ThermometerSun,
  Droplets,
  Sun,
  Wind,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

export default function EnvironmentalAnalysisView() {
  const [simTemp, setSimTemp] = useState(28);
  const [simHumidity, setSimHumidity] = useState(82);

  // Compute VPD and pathogen risk
  // Saturated Vapor Pressure (VPsat) in kPa: 0.61078 * exp((17.27 * T) / (T + 237.3))
  const vpSat = 0.61078 * Math.exp((17.27 * simTemp) / (simTemp + 237.3));
  const vpAir = vpSat * (simHumidity / 100);
  const vpd = Math.max(0, vpSat - vpAir); // in kPa

  // Pathogen risk evaluation
  let riskLevel = 'Low';
  let riskColor = '#10b981';
  let riskGuidance = 'Greenhouse microclimate is within safe physiological bounds for transpiration and fungal spore suppression.';

  if (simHumidity > 80 && simTemp >= 24 && simTemp <= 32) {
    riskLevel = 'Critical';
    riskColor = '#ef4444';
    riskGuidance = 'High risk of Anthracnose, Powdery Mildew, and Bacterial Canker sporulation due to extended leaf wetness and high VPD suppression.';
  } else if (simHumidity > 75 || (simTemp > 32 && simHumidity > 60)) {
    riskLevel = 'Moderate';
    riskColor = '#f59e0b';
    riskGuidance = 'Elevated humidity may trigger fungal condensation on leaves during nighttime cooling. Engage greenhouse extraction fans.';
  } else if (vpd > 1.6) {
    riskLevel = 'High (Drying Stress)';
    riskColor = '#f97316';
    riskGuidance = 'Canopy transpiration demand is excessively high. Risk of moisture stress, stomatal closure, and leaf marginal scorching.';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <ThermometerSun size={18} color="#10b981" />
          <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.05em' }}>
            GREENHOUSE CLIMATE TELEMETRY
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc' }}>
          Environmental & Microclimate Analysis
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem' }}>
          Greenhouse pathogens are strongly modulated by canopy vapor pressure deficit (VPD), ambient temperature,
          and prolonged relative humidity. Explore microclimate risk thresholds below.
        </p>
      </div>

      {/* Target Microclimate Parameter Bands */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.2rem' }}>
        <div className="feature-card" style={{ padding: '1.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f97316', marginBottom: '0.5rem' }}>
            <ThermometerSun size={18} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Temperature Band</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>22°C - 30°C</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Sub-20°C slows plant metabolism; {'>'}34°C triggers thermal shock and pollen abortion.
          </p>
        </div>

        <div className="feature-card" style={{ padding: '1.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', marginBottom: '0.5rem' }}>
            <Droplets size={18} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Relative Humidity</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>60% - 75%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {'>'}80% promotes fungal spore germination; {'<'}50% induces moisture stress.
          </p>
        </div>

        <div className="feature-card" style={{ padding: '1.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', marginBottom: '0.5rem' }}>
            <Sun size={18} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Solar Radiation</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>400 - 800 W/m²</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Adequate PAR flux for active photosynthesis without photo-inhibition.
          </p>
        </div>

        <div className="feature-card" style={{ padding: '1.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a3e635', marginBottom: '0.5rem' }}>
            <Wind size={18} />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Airflow Circulation</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>0.5 - 1.8 m/s</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Gentle canopy airflow prevents stagnant humid micro-pockets within leaves.
          </p>
        </div>
      </div>

      {/* Interactive Microclimate Pathogen Risk Simulator */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.8rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}
      >
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc' }}>
              Microclimate Pathogen Risk Simulator
            </h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Adjust greenhouse parameters to simulate how temperature and relative humidity shift canopy Vapor
            Pressure Deficit (VPD) and fungal pathogen susceptibility.
          </p>

          {/* Temperature Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 500 }}>
                Greenhouse Temperature: <b>{simTemp}°C</b>
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Range: 15°C – 40°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="40"
              step="1"
              value={simTemp}
              onChange={(e) => setSimTemp(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#10b981' }}
            />
          </div>

          {/* Humidity Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: 500 }}>
                Relative Humidity: <b>{simHumidity}%</b>
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Range: 30% – 100%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="1"
              value={simHumidity}
              onChange={(e) => setSimHumidity(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>
        </div>

        {/* Dynamic Risk Gauge & Output */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '14px',
            border: `1px solid ${riskColor}40`,
            padding: '1.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Simulated Risk Assessment</span>
            <span
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: `${riskColor}20`,
                color: riskColor,
                border: `1px solid ${riskColor}50`
              }}
            >
              {riskLevel}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
                {vpd.toFixed(2)} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#94a3b8' }}>kPa</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Vapor Pressure Deficit (VPD)</div>
            </div>
          </div>

          <div
            style={{
              padding: '0.9rem',
              borderRadius: '8px',
              background: 'rgba(10, 15, 29, 0.6)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.88rem',
              color: '#cbd5e1',
              lineHeight: 1.5
            }}
          >
            {riskGuidance}
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            * Ideal vegetative VPD: 0.8 to 1.2 kPa. High humidity suppresses VPD below 0.4 kPa, creating water droplets on foliage where spores germinate.
          </div>
        </div>
      </div>
    </div>
  );
}
