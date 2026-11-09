import React from 'react';

export default function HowItWorksMarquee() {
  const steps = [
    { num: '01', title: 'Open Farm Workspace', desc: 'Log in to your private crop dashboard from phone, tablet, or PC.' },
    { num: '02', title: 'Take Leaf Photo', desc: 'Capture a clear picture of any leaves showing stress or spots.' },
    { num: '03', title: 'Add Temperature & Humidity', desc: 'Note greenhouse heat and moisture to verify disease conditions.' },
    { num: '04', title: 'Instant Health Scan', desc: 'The system examines leaf patterns and symptoms in seconds.' },
    { num: '05', title: 'Identify Exact Disease', desc: 'Know if it is Anthracnose, Mildew, Canker, or healthy foliage.' },
    { num: '06', title: 'Inspect Leaf Damage Map', desc: 'See color-highlighted areas showing where infection started.' },
    { num: '07', title: 'Check Severity Level', desc: 'Understand whether the problem is mild, moderate, or urgent.' },
    { num: '08', title: 'Follow Treatment Guide', desc: 'Get practical fungicide, organic spray, and ventilation advice.' },
    { num: '09', title: 'Track Recovery Over Time', desc: 'Compare new photos over weeks to confirm your crop is healing.' }
  ];

  // Duplicate for seamless infinite marquee loop
  const duplicated = [...steps, ...steps];

  return (
    <section id="how-it-works" style={{ padding: '5rem 0', background: 'var(--bg-cream)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto 2.5rem auto', padding: '0 2rem', textAlign: 'center' }}>
        <span className="section-tag">STEP-BY-STEP WORKFLOW</span>
        <h2 className="section-title">From Leaf Observation to Healthy Harvest</h2>
        <p className="section-desc">
          Hover over any card to pause and read. AgroVita AI guides you from first symptom to full recovery.
        </p>
      </div>

      <div className="marquee-container">
        <div className="marquee-track">
          {duplicated.map((item, index) => (
            <div key={index} className="marquee-card">
              <span className="marquee-step">STEP {item.num}</span>
              <h4 className="marquee-title">{item.title}</h4>
              <p className="marquee-text">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
