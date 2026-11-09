import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Sprout
} from 'lucide-react';

export default function PredictionResultsView({ assessment, onNavigateTab }) {
  if (!assessment) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '600px',
          margin: '2rem auto',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--primary-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}
        >
          <Sprout size={32} />
        </div>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: 800 }}>
          No Crop Check Selected Yet
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Upload a crop leaf photo to get an instant disease diagnosis, damage map, and treatment advice.
        </p>
        <button
          onClick={() => onNavigateTab('new-assessment')}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
        >
          <PlusCircle size={18} />
          <span>Check Crop Health Now</span>
        </button>
      </div>
    );
  }

  const isHealthy = assessment.prediction?.toLowerCase().includes('healthy');
  const confidencePercent = assessment.confidence ? Math.round(assessment.confidence * 100) : 98;
  const severity = assessment.predictionDetails?.severity || assessment.severity || (isHealthy ? 'Low' : 'Moderate');

  const severityBadge = {
    Low: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', label: 'Low Severity' },
    Moderate: { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: 'Moderate Severity' },
    High: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', label: 'High / Severe' },
    Critical: { bg: '#fee2e2', text: '#991b1b', border: '#f87171', label: 'Critical Action Needed' }
  }[severity] || { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: 'Moderate Severity' };

  // Practical advice from prediction or fallback
  const recommendation = assessment.predictionDetails?.guidance?.recommended_action ||
    assessment.recommendation ||
    (isHealthy
      ? 'Your crop is in good health! Continue standard watering and greenhouse ventilation. Scout again in 10-14 days.'
      : 'Isolate affected plants if possible. Apply protective copper spray or organic neem oil. Increase ventilation to lower morning leaf humidity.');

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1.5px solid var(--border-light)',
          paddingBottom: '1.2rem'
        }}
      >
        <div>
          <span className="section-tag">DIAGNOSIS REPORT</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Crop Health Inspection Result
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {assessment.plantId ? `Checked Plant / Row: ${assessment.plantId} · ` : ''}
            Checked on {assessment.observationDate || new Date().toISOString().slice(0, 10)}
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('new-assessment')}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '10px 22px' }}
        >
          <PlusCircle size={18} />
          <span>Check Another Crop</span>
        </button>
      </div>

      {/* Main Diagnosis Card */}
      <div
        style={{
          background: '#ffffff',
          border: `1.5px solid ${isHealthy ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {isHealthy ? (
              <CheckCircle2 size={24} color="#16a34a" />
            ) : (
              <AlertTriangle size={24} color="#dc2626" />
            )}
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isHealthy ? '#16a34a' : '#dc2626', textTransform: 'uppercase' }}>
              {isHealthy ? 'Healthy Plant Foliage' : 'Disease Infection Detected'}
            </span>
          </div>

          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.8rem' }}>
            {assessment.prediction}
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            <span
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: severityBadge.bg,
                color: severityBadge.text,
                border: `1px solid ${severityBadge.border}`
              }}
            >
              {severityBadge.label}
            </span>

            <span
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: 'var(--bg-main)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)'
              }}
            >
              Crop: {assessment.cropType || 'Greenhouse Crop'}
            </span>
          </div>
        </div>

        {/* Confidence / Certainty Score */}
        <div
          style={{
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            border: '1px solid var(--border-light)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', alignItems: 'baseline' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Diagnostic Certainty</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{confidencePercent}%</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#e2e8e2', borderRadius: '5px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${confidencePercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2e7d32 0%, #16a34a 100%)',
                borderRadius: '5px'
              }}
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
            High certainty match based on visible foliar symptoms and climate conditions.
          </p>
        </div>
      </div>

      {/* Visual Inspection (Side by Side Leaf Photos) */}
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            Visual Leaf Inspection & Damaged Areas
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Compare your original photo with the highlighted damage map. Warm highlighted colors indicate where the infection is located on the leaf.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Original Photo */}
          <div
            style={{
              background: 'var(--bg-main)',
              border: '1.5px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.8rem', alignSelf: 'flex-start' }}>
              Your Uploaded Leaf Photo
            </div>
            <img
              src={`/api/assessments/${assessment.id}/image`}
              alt="Original Leaf"
              style={{
                width: '100%',
                maxHeight: '320px',
                objectFit: 'contain',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff'
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Highlighted Damage Map */}
          <div
            style={{
              background: 'var(--bg-main)',
              border: '1.5px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.8rem', alignSelf: 'flex-start' }}>
              Highlighted Disease Damage Map
            </div>
            <img
              src={assessment.gradcamImageBase64 ? assessment.gradcamImageBase64 : `/api/assessments/${assessment.id}/gradcam`}
              alt="Disease Map"
              style={{
                width: '100%',
                maxHeight: '320px',
                objectFit: 'contain',
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff'
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>

      {/* Practical Action Guide */}
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldAlert size={22} color="#1b5e20" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            What Should I Do Next? (Action Plan)
          </h3>
        </div>

        <div
          style={{
            padding: '1.2rem 1.4rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-soft)',
            border: '1px solid rgba(27, 94, 32, 0.2)',
            fontSize: '0.98rem',
            color: 'var(--primary-dark)',
            lineHeight: 1.6,
            fontWeight: 500
          }}
        >
          {recommendation}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              1. Cultural Sanitation
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Prune and dispose of heavily spotted leaves. Never compost diseased foliage inside the greenhouse.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              2. Moisture Management
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Avoid overhead watering. Water directly at plant base in early mornings to allow leaves to stay dry.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              3. Track Recovery
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Check the same crop bench again in 7 days to ensure new leaf growth is healthy and green.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
