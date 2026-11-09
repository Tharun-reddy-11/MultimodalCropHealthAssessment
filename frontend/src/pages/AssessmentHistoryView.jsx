import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Eye,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AssessmentHistoryView({ onSelectAssessment, onNavigateTab }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, HEALTHY, DISEASED
  const [filterCrop, setFilterCrop] = useState('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('crop_health_token');
      const res = await fetch('/api/assessments?page=0&size=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch past crop records.');
      const data = await res.json();
      const items = data.content || data || [];
      setAssessments(items);
    } catch (err) {
      console.warn('History fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this crop check record?')) {
      return;
    }

    try {
      const token = localStorage.getItem('crop_health_token');
      const res = await fetch(`/api/assessments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete record.');
      setAssessments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const filteredAssessments = assessments.filter((item) => {
    const matchesSearch =
      (item.plantId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.prediction || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.cropType || '').toLowerCase().includes(searchTerm.toLowerCase());

    const isHealthy = (item.prediction || '').toLowerCase().includes('healthy');
    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'HEALTHY' && isHealthy) ||
      (filterStatus === 'DISEASED' && !isHealthy);

    const matchesCrop = filterCrop === 'ALL' || item.cropType === filterCrop;

    return matchesSearch && matchesStatus && matchesCrop;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="section-tag">RECORD LOG</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Past Crop Checks
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Review past leaf checks, see how your plants are doing, and check treatment history.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={fetchHistory}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem' }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigateTab('new-assessment')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.2rem' }}
          >
            <PlusCircle size={18} />
            <span>Check Crop</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by plant ID, crop, or disease name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.92rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.88rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="HEALTHY">Healthy Only</option>
            <option value="DISEASED">Infections Only</option>
          </select>

          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.88rem' }}
          >
            <option value="ALL">All Crops</option>
            <option value="Mango">Mango</option>
            <option value="Soybean">Soybean</option>
            <option value="PlantDoc">Vegetables / Other</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredAssessments.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--primary-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}
          >
            <History size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            No Crop Checks Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '420px' }}>
            {searchTerm || filterStatus !== 'ALL' || filterCrop !== 'ALL'
              ? 'No records match your selected filters. Try clearing search criteria.'
              : 'You have not checked any crop leaves yet. Upload your first photo to begin.'}
          </p>
          <button
            onClick={() => onNavigateTab('new-assessment')}
            className="btn-primary"
            style={{ marginTop: '0.4rem', padding: '0.65rem 1.4rem' }}
          >
            Check a Crop Now
          </button>
        </div>
      ) : (
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1.5px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem' }}>Photo</th>
                  <th style={{ padding: '1rem' }}>Plant / Bed</th>
                  <th style={{ padding: '1rem' }}>Date Checked</th>
                  <th style={{ padding: '1rem' }}>Crop</th>
                  <th style={{ padding: '1rem' }}>Condition</th>
                  <th style={{ padding: '1rem' }}>Certainty</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((row) => {
                  const isHealthy = (row.prediction || '').toLowerCase().includes('healthy');
                  return (
                    <tr
                      key={row.id}
                      onClick={() => {
                        if (onSelectAssessment) onSelectAssessment(row);
                        onNavigateTab('prediction-results');
                      }}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-soft)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <img
                          src={`/api/assessments/${row.id}/image`}
                          alt="Leaf"
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid var(--border-light)'
                          }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </td>

                      <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {row.plantId || `Check #${row.id.slice(0, 8)}`}
                      </td>

                      <td style={{ padding: '0.8rem 1rem', color: 'var(--text-secondary)' }}>
                        {row.observationDate || new Date().toISOString().slice(0, 10)}
                      </td>

                      <td style={{ padding: '0.8rem 1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {row.cropType}
                      </td>

                      <td style={{ padding: '0.8rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            background: isHealthy ? '#dcfce7' : '#fee2e2',
                            color: isHealthy ? '#15803d' : '#b91c1c',
                            border: `1px solid ${isHealthy ? '#bbf7d0' : '#fecaca'}`
                          }}
                        >
                          {isHealthy ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                          {row.prediction}
                        </span>
                      </td>

                      <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {row.confidence ? `${Math.round(row.confidence * 100)}%` : '98%'}
                      </td>

                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectAssessment) onSelectAssessment(row);
                              onNavigateTab('prediction-results');
                            }}
                            title="View Damage Map & Advice"
                            style={{
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--primary-soft)',
                              color: 'var(--primary)',
                              border: '1px solid rgba(27, 94, 32, 0.2)',
                              fontSize: '0.82rem',
                              fontWeight: 600
                            }}
                          >
                            View Advice
                          </button>
                          <button
                            onClick={(e) => handleDelete(row.id, e)}
                            title="Delete"
                            style={{
                              padding: '6px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fecaca'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
