import React from 'react';
import Navbar from '../components/Navbar';
import VideoHero from '../components/VideoHero';
import WorkingFlowCards from '../components/WorkingFlowCards';
import HowItWorksMarquee from '../components/HowItWorksMarquee';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';

export default function LandingPage({ onNavigate }) {
  const handleScrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      <Navbar onNavigate={onNavigate} />
      
      <main style={{ flex: 1 }}>
        <VideoHero
          onStartAssessment={() => onNavigate('register')}
          onExploreFeatures={handleScrollToFeatures}
        />
        <WorkingFlowCards />
        <HowItWorksMarquee />
        <AboutSection onRegister={() => onNavigate('register')} />
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
