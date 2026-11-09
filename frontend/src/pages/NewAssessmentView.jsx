import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';

export default function NewAssessmentView({ onAssessmentCreated, onNavigateTab }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropType, setCropType] = useState('Mango');
  const [plantId, setPlantId] = useState('');
  const [growthStage, setGrowthStage] = useState('Vegetative');
  const [observationDate, setObservationDate] = useState(new Date().toISOString().slice(0, 10));

  // Environmental readings (optional, helps the multimodal fusion model)
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [rainfall, setRainfall] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMsg('Please upload a JPG or PNG leaf photograph.');
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 15 MB. Please select a smaller photo.');
      return;
    }

    setFile(selectedFile);
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearSelectedFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!file) {
      setErrorMsg('Please upload a leaf photo before checking crop health.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('crop_health_token');
      const formData = new FormData();
      formData.append('image', file);
      formData.append('crop_type', cropType);
      formData.append('observation_date', observationDate);
      // Always defaults to multimodal fusion under the hood without confusing the farmer
      formData.append('mode', 'fusion');

      if (plantId) formData.append('plant_id', plantId);
      if (growthStage) formData.append('growth_stage', growthStage);
      if (notes) formData.append('notes', notes);

      if (temperature !== '') formData.append('temperature', temperature);
      if (humidity !== '') formData.append('humidity', humidity);
      if (rainfall !== '') formData.append('rainfall', rainfall);
      if (windSpeed !== '') formData.append('wind_speed', windSpeed);

      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server could not process crop check.');
      }

      if (onAssessmentCreated) {
        onAssessmentCreated(data);
      }
      onNavigateTab('prediction-results');
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during crop diagnosis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <span className="section-tag">CROP HEALTH INSPECTION</span>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          Check Your Crop Health
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem' }}>
          Upload a clear leaf photo. Our AI scans for 8 major crop diseases, highlights infected areas,
          and gives you immediate spray and treatment steps.
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '1rem 1.2rem',
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: 'var(--radius-sm)',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontSize: '0.92rem',
            fontWeight: 500
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
        {/* Step 1: Upload Photo */}
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              1. Upload Leaf Photograph <span className="required-star">*</span>
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>JPG or PNG image</span>
          </div>

          {!previewUrl ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging ? 'var(--primary-soft)' : 'var(--bg-main)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--primary-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}
              >
                <UploadCloud size={30} />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '0.3rem' }}>
                  Click to select a leaf photo or drag & drop here
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Take a clear, well-lit photo showing the affected spots or discolored areas.
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-main)',
                border: '1.5px solid var(--border-light)',
                padding: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <img
                src={previewUrl}
                alt="Selected leaf"
                style={{
                  maxHeight: '320px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
              <div
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: '0 0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {file?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  style={{
                    color: '#dc2626',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#fee2e2',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px'
                  }}
                >
                  <X size={14} /> Remove Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Crop Details */}
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.2rem' }}>
            2. Crop & Field Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
            <div>
              <label className="form-label">
                Crop Type <span className="required-star">*</span>
              </label>
              <select
                className="form-input"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
              >
                <option value="Mango">Mango Crop</option>
                <option value="Soybean">Soybean Crop</option>
                <option value="PlantDoc">Greenhouse Vegetables & Plants</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Row / Plant Identifier (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Greenhouse Bay 3, Row 5"
                value={plantId}
                onChange={(e) => setPlantId(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">
                Growth Stage
              </label>
              <select
                className="form-input"
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
              >
                <option value="Vegetative">Growing / Vegetative</option>
                <option value="Flowering">Flowering</option>
                <option value="Fruit Set">Fruiting / Pod Formation</option>
                <option value="Mature">Mature Canopy</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Date Checked <span className="required-star">*</span>
              </label>
              <input
                type="date"
                required
                className="form-input"
                value={observationDate}
                onChange={(e) => setObservationDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Weather & Climate Readings */}
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              3. Weather & Greenhouse Conditions <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Optional, helps diagnosis)</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Temperature and moisture influence fungal and bacterial spread. Enter your local readings if available.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem' }}>
            <div>
              <label className="form-label">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="e.g. 28.5"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Relative Humidity (%)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="e.g. 75"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Rainfall / Water (mm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="e.g. 5"
                value={rainfall}
                onChange={(e) => setRainfall(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Airflow / Wind (m/s)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="e.g. 1.2"
                value={windSpeed}
                onChange={(e) => setWindSpeed(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.2rem' }}>
            <label className="form-label">Visible Symptoms & Farm Notes</label>
            <textarea
              rows={2}
              className="form-input"
              placeholder="e.g. Dark spots on leaf edges, leaves curling under humid mornings..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '14px 36px', fontSize: '1.05rem', gap: '8px' }}
          >
            {loading ? (
              <span>Analyzing Leaf & Weather...</span>
            ) : (
              <>
                <span>Check Crop Health Now</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
