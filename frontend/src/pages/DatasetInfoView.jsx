import React, { useState } from 'react';
import {
  Database,
  Layers,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';

export default function DatasetInfoView() {
  const [selectedClass, setSelectedClass] = useState('Anthracnose');

  const mangoClasses = [
    {
      name: 'Anthracnose',
      symptoms: 'Dark brown to black necrotic spots with irregular margins, often coalescing into large blighted areas causing leaf defoliation.',
      pathogen: 'Colletotrichum gloeosporioides (Fungal)',
      favorableClimate: 'High relative humidity (>80%) and temperatures between 25°C and 30°C.',
      management: 'Pruning infected foliage, prophylactic copper oxychloride sprays, improving greenhouse canopy airflow.'
    },
    {
      name: 'Bacterial Canker',
      symptoms: 'Water-soaked angular lesions with chlorotic yellow halos, developing raised corky margins.',
      pathogen: 'Xanthomonas campestris pv. mangiferaeindicae (Bacterial)',
      favorableClimate: 'Wind-driven rain, microclimate humidity, and mechanical wounding.',
      management: 'Strict greenhouse hygiene, copper bactericide applications, avoiding overhead sprinkler irrigation.'
    },
    {
      name: 'Cutting Weevil',
      symptoms: 'Clean transverse foliar cuts made by adult weevils, severed leaf tips and margins.',
      pathogen: 'Deporaus marginatus (Coleoptera Insect)',
      favorableClimate: 'Flushing vegetative stages, warm daytime temperatures.',
      management: 'Monitoring canopy flushes, targeted biopesticide or neem oil sprays, collecting fallen clipped foliage.'
    },
    {
      name: 'Die Back',
      symptoms: 'Discoloration and blighting of foliage starting from leaf margins inward, drying of twigs from top downward.',
      pathogen: 'Lasiodiplodia theobromae (Fungal)',
      favorableClimate: 'Thermal stress followed by high humidity and vascular wounding.',
      management: 'Pruning desiccated shoots below the infected zone, copper paste application, balanced irrigation.'
    },
    {
      name: 'Gall Midge',
      symptoms: 'Raised wart-like foliar pustules or galls on leaf surfaces caused by larval feeding inside leaf mesophyll.',
      pathogen: 'Procontarinia matteiana (Diptera Insect)',
      favorableClimate: 'High humidity and tender young canopy flushes.',
      management: 'Canopy pruning to increase solar penetration, yellow sticky traps, microbial entomopathogens.'
    },
    {
      name: 'Healthy',
      symptoms: 'Vibrant emerald green leaf lamina, intact cuticle, uniform venation without chlorosis or necrosis.',
      pathogen: 'None (Healthy foliage)',
      favorableClimate: 'Optimal greenhouse VPD (0.8 - 1.2 kPa), 24°C - 28°C, balanced nutrition.',
      management: 'Maintain regular irrigation schedule, ambient airflow, and prophylactic preventative scouting.'
    },
    {
      name: 'Powdery Mildew',
      symptoms: 'White powdery superficial fungal mycelium coating the upper and lower leaf surface, foliar distortion.',
      pathogen: 'Oidium mangiferae (Fungal)',
      favorableClimate: 'Moderate temperatures (20°C - 26°C) and cloudy days with high morning relative humidity.',
      management: 'Sulfur-based fungicides, potassium bicarbonate foliar sprays, venting greenhouse early mornings.'
    },
    {
      name: 'Sooty Mould',
      symptoms: 'Black velvety soot-like layer covering leaf lamina, obstructing sunlight and photosynthetic activity.',
      pathogen: 'Meliola mangiferae / Capnodium (Secondary Fungal Saprophyte)',
      favorableClimate: 'Secondary growth following honeydew excretion from sap-sucking pests (aphids, scales, mealybugs).',
      management: 'Controlling underlying sap-sucking insects, foliar washing with 1% starch solution or soap.'
    }
  ];

  const currentClassInfo = mangoClasses.find((c) => c.name === selectedClass) || mangoClasses[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <Database size={18} color="#10b981" />
          <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.05em' }}>
            SCIENTIFIC REPOSITORIES & DATASET AUDIT
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc' }}>
          Dataset Repositories & Class Taxonomy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem' }}>
          Comprehensive inventory of authentic agricultural computer vision datasets present in this workspace,
          featuring 9,128 total real foliar images verified across peer-reviewed benchmarks.
        </p>
      </div>

      {/* Dataset Inventory Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.4rem' }}>
        {/* MangoLeafBD */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.05em' }}>
              PRIMARY TRAINING CORPUS
            </span>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>8 Classes</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>MangoLeafBD</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Balanced dataset consisting of 4,000 real mango leaf images (500 images per class) across 8 pathological categories.
          </p>
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem', fontSize: '0.82rem', color: '#94a3b8' }}>
            Status: <b style={{ color: '#10b981' }}>Model Trained & Active (99.75%)</b>
          </div>
        </div>

        {/* MH-SoyaHealthVision */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em' }}>
              SOYBEAN BENCHMARK
            </span>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>10 Classes</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>MH-SoyaHealthVision</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            2,782 foliar images of greenhouse and field soybean crops covering rust, frogeye leaf spot, and healthy stages.
          </p>
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem', fontSize: '0.82rem', color: '#94a3b8' }}>
            Status: <b style={{ color: '#38bdf8' }}>Verified Repository</b>
          </div>
        </div>

        {/* PlantDoc */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a855f7', letterSpacing: '0.05em' }}>
              MULTI-CROP BENCHMARK
            </span>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>17 Classes</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>PlantDoc Dataset</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            2,346 natural scene foliar photographs across diverse horticultural species in unconstrained greenhouse settings.
          </p>
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.8rem', fontSize: '0.82rem', color: '#94a3b8' }}>
            Status: <b style={{ color: '#a855f7' }}>Verified Repository</b>
          </div>
        </div>
      </div>

      {/* Interactive Class Taxonomy Explorer */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.3rem' }}>
            Mango Foliage Pathogen Taxonomy Explorer
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Select any of the 8 classes trained into our MobileNetV2 vision backbone to view symptomology and greenhouse intervention protocols.
          </p>
        </div>

        {/* Class Selection Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          {mangoClasses.map((item) => {
            const isSelected = item.name === selectedClass;
            return (
              <button
                key={item.name}
                onClick={() => setSelectedClass(item.name)}
                style={{
                  padding: '0.6rem 1.1rem',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                  color: isSelected ? '#10b981' : '#cbd5e1',
                  transition: 'all 0.2s'
                }}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Selected Class Information Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>
              {currentClassInfo.name}
            </h4>
            <span
              style={{
                fontSize: '0.82rem',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '0.3rem 0.7rem',
                borderRadius: '6px'
              }}
            >
              500 Images in Corpus
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Biological Pathogen
              </div>
              <div style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 500 }}>
                {currentClassInfo.pathogen}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Favorable Microclimate
              </div>
              <div style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: 500 }}>
                {currentClassInfo.favorableClimate}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Foliar Diagnostic Symptoms
            </div>
            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              {currentClassInfo.symptoms}
            </p>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Greenhouse Intervention & Control
            </div>
            <p style={{ fontSize: '0.92rem', color: '#10b981', lineHeight: 1.5 }}>
              {currentClassInfo.management}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
