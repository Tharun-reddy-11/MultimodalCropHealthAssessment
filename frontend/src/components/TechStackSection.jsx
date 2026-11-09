import React from 'react';
import { Cpu, Server, Database, Code, Shield, Brain, Layers, Sparkles } from 'lucide-react';

const TECHS = [
  { name: 'React.js 18', role: 'Vite Single-Page Application & Dynamic State', icon: Code, color: '#06b6d4' },
  { name: 'Spring Boot 3.4.5', role: 'Enterprise Java Orchestration & Security', icon: Server, color: '#10b981' },
  { name: 'MySQL 8.0', role: 'Relational Persistence, Foreign Keys & Indexes', icon: Database, color: '#f59e0b' },
  { name: 'Python FastAPI', role: 'High-Performance Asynchronous ML Inference Microservice', icon: Cpu, color: '#3b82f6' },
  { name: 'PyTorch 2.15', role: 'MobileNetV2 Deep Learning & Tensor Operations', icon: Brain, color: '#ef4444' },
  { name: 'Multimodal Fusion', role: 'Late-Fusion Neural Network Combining Vision & Climate', icon: Layers, color: '#8b5cf6' },
  { name: 'Grad-CAM XAI', role: 'Gradient-Weighted Class Activation Mapping Heatmaps', icon: Sparkles, color: '#10b981' },
  { name: 'Spring Security + JWT', role: 'Stateless Authentication & Role-Based Authorization', icon: Shield, color: '#06b6d4' },
];

export default function TechStackSection() {
  return (
    <section id="tech-stack" className="section-wrapper">
      <div className="section-header">
        <div className="eyebrow">
          <Cpu size={14} /> Full Stack Architecture
        </div>
        <h2>Enterprise Technology Stack</h2>
        <p>
          Engineered as a decoupled three-tier architecture: Reactive UI, Enterprise Java orchestration layer,
          and dedicated Python PyTorch inference server.
        </p>
      </div>

      <div className="tech-grid">
        {TECHS.map((t) => {
          const IconComp = t.icon;
          return (
            <div key={t.name} className="tech-card">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
                <IconComp size={34} color={t.color} />
              </div>
              <h3 className="tech-name">{t.name}</h3>
              <p className="tech-role">{t.role}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
