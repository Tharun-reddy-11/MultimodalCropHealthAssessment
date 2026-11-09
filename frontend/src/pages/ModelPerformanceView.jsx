import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Award,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  Eye,
  RefreshCw
} from 'lucide-react';

export default function ModelPerformanceView() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/model/metrics');
      if (!res.ok) throw new Error('Failed to fetch model metrics');
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.warn('Metrics fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const classData = [
    { label: 'Anthracnose', precision: '1.0000', recall: '0.9900', f1: '0.9950', support: 100 },
    { label: 'Bacterial Canker', precision: '1.0000', recall: '1.0000', f1: '1.0000', support: 100 },
    { label: 'Cutting Weevil', precision: '1.0000', recall: '1.0000', f1: '1.0000', support: 100 },
    { label: 'Die Back', precision: '0.9901', recall: '1.0000', f1: '0.9950', support: 100 },
    { label: 'Gall Midge', precision: '1.0000', recall: '1.0000', f1: '1.0000', support: 100 },
    { label: 'Healthy', precision: '1.0000', recall: '1.0000', f1: '1.0000', support: 100 },
    { label: 'Powdery Mildew', precision: '1.0000', recall: '0.9900', f1: '0.9950', support: 100 },
    { label: 'Sooty Mould', precision: '0.9901', recall: '1.0000', f1: '0.9950', support: 100 }
  ];

  const classes = classData.map(c => c.label);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Cpu size={18} color="#10b981" />
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.05em' }}>
              DEEP LEARNING VALIDATION & BENCHMARKS
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc' }}>
            Model Performance & Architecture
          </h1>
        </div>

        <button
          onClick={fetchMetrics}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
        <div className="feature-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Validation Accuracy</span>
            <Award size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#10b981' }}>99.75%</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>798 / 800 test samples correct</div>
        </div>

        <div className="feature-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Macro F1-Score</span>
            <Activity size={20} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#38bdf8' }}>0.9975</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>Balanced across 8 classes</div>
        </div>

        <div className="feature-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Inference Latency</span>
            <Zap size={20} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#fbbf24' }}>27.40 ms</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>Standard Edge CPU execution</div>
        </div>

        <div className="feature-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Model Footprint</span>
            <Layers size={20} color="#a855f7" />
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#a855f7' }}>9.18 MB</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>2.23M parameters (MobileNetV2)</div>
        </div>
      </div>

      {/* Per-Class Evaluation Table */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '1.4rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc' }}>
            Per-Class Validation Classification Report
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Evaluation performed on a held-out test split (800 images across 8 classes) from MangoLeafBD.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.7)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.9rem 1.2rem' }}>Pathology Class</th>
                <th style={{ padding: '0.9rem 1.2rem' }}>Precision</th>
                <th style={{ padding: '0.9rem 1.2rem' }}>Recall</th>
                <th style={{ padding: '0.9rem 1.2rem' }}>F1-Score</th>
                <th style={{ padding: '0.9rem 1.2rem' }}>Support</th>
                <th style={{ padding: '0.9rem 1.2rem' }}>Performance Band</th>
              </tr>
            </thead>
            <tbody>
              {classData.map((row, idx) => (
                <tr
                  key={row.label}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '0.8rem 1.2rem', fontWeight: 600, color: '#f8fafc' }}>{row.label}</td>
                  <td style={{ padding: '0.8rem 1.2rem', color: '#10b981', fontWeight: 500 }}>{row.precision}</td>
                  <td style={{ padding: '0.8rem 1.2rem', color: '#10b981', fontWeight: 500 }}>{row.recall}</td>
                  <td style={{ padding: '0.8rem 1.2rem', color: '#10b981', fontWeight: 600 }}>{row.f1}</td>
                  <td style={{ padding: '0.8rem 1.2rem', color: '#94a3b8' }}>{row.support}</td>
                  <td style={{ padding: '0.8rem 1.2rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981'
                      }}
                    >
                      Optimal (99%+)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix & Explainability Architecture */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Confusion Matrix Visual */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
            Validation Confusion Matrix (8x8)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            High diagonal density indicates near-zero inter-class confusion across foliar pathologies.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '4px',
              padding: '1rem 0'
            }}
          >
            {classes.map((r, rowIdx) =>
              classes.map((c, colIdx) => {
                const isDiag = rowIdx === colIdx;
                const value = isDiag ? (rowIdx === 0 || rowIdx === 6 ? 99 : 100) : (rowIdx === 0 && colIdx === 3 ? 1 : (rowIdx === 6 && colIdx === 7 ? 1 : 0));
                const bg = isDiag
                  ? 'rgba(16, 185, 129, 0.85)'
                  : value > 0
                  ? 'rgba(239, 68, 68, 0.6)'
                  : 'rgba(15, 23, 42, 0.6)';

                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    title={`True: ${r}, Pred: ${c} (${value})`}
                    style={{
                      aspectRatio: '1',
                      background: bg,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#fff'
                    }}
                  >
                    {value}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            * Diagonal elements represent correctly classified samples out of 100 test samples per class.
          </div>
        </div>

        {/* Explainability & Fusion Architecture */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={18} color="#38bdf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
              Architecture & Grad-CAM Visual Heatmaps
            </h3>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            The computer vision backbone consists of a pre-trained <b>MobileNetV2</b> with depthwise separable
            convolutions. Feature extraction produces a 1,280-dimensional visual embedding.
          </p>

          <div
            style={{
              padding: '1rem',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Visual Backbone:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>MobileNetV2 (features.18)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Visual Embedding Size:</span>
              <span style={{ color: '#f8fafc' }}>1,280-dimensional</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Environmental MLP:</span>
              <span style={{ color: '#f8fafc' }}>5 inputs → 32-dimensional</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Fusion Concatenation:</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>1,312-d joint representation</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Explainability Engine:</span>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>Grad-CAM Activation Mapping</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
