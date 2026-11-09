import React from 'react';

export default function WorkingFlowCards() {
  const cards = [
    {
      step: 'Step 01',
      title: 'Capture Foliage & Climate',
      desc: 'Take a clear leaf photo on your smartphone and log greenhouse temperature, humidity, and weather conditions.',
      image: '/cards/step_1.png'
    },
    {
      step: 'Step 02',
      title: 'Multimodal AI Fusion',
      desc: 'Deep CNN processes leaf lesion patterns while MLP neural network fuses real-time microclimate sensor telemetry.',
      image: '/cards/step_2.png'
    },
    {
      step: 'Step 03',
      title: 'Grad-CAM Disease Map',
      desc: 'Receive instant disease classification with explainable visual Grad-CAM heatmaps showing exact lesion zones.',
      image: '/cards/step_3.png'
    },
    {
      step: 'Step 04',
      title: 'Targeted Care & Monitoring',
      desc: 'Access immediate protective treatment advice, spray recommendations, and track crop recovery over time.',
      image: '/cards/step_4.png'
    }
  ];

  return (
    <section id="features" className="workflow-section">
      <div className="section-head">
        <span className="section-tag">EASY 4-STEP CROP CHECK</span>
        <h2 className="section-title">How AgroVita AI Protects Your Harvest</h2>
        <p className="section-desc">
          Designed specifically for practical farm and greenhouse operations. Simple, accurate, and actionable.
        </p>
      </div>

      <div className="workflow-grid">
        {cards.map((card, idx) => (
          <div key={idx} className="workflow-card">
            <img
              src={card.image}
              alt={card.title}
              className="workflow-card-bg"
            />
            <div className="workflow-card-overlay" />
            <div className="workflow-card-content">
              <span className="workflow-card-step">{card.step}</span>
              <h3 className="workflow-card-title">{card.title}</h3>
              <p className="workflow-card-desc">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
