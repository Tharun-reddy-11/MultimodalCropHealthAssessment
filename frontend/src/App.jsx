import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './pages/DashboardLayout';

import OverviewView from './pages/OverviewView';
import NewAssessmentView from './pages/NewAssessmentView';
import PredictionResultsView from './pages/PredictionResultsView';
import AssessmentHistoryView from './pages/AssessmentHistoryView';
import CropHealthAnalyticsView from './pages/CropHealthAnalyticsView';
import ProfileSettingsView from './pages/ProfileSettingsView';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // 'landing', 'login', 'register', 'dashboard'
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);

  // Check saved session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('crop_health_token');
    const savedUser = localStorage.getItem('crop_health_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setCurrentScreen('dashboard');
      } catch (e) {
        localStorage.removeItem('crop_health_token');
        localStorage.removeItem('crop_health_user');
      }
    }
  }, []);

  const handleAuthSuccess = (authData) => {
    setUser(authData.user);
    setCurrentScreen('dashboard');
    setActiveTab('overview');
  };

  const handleLogout = () => {
    localStorage.removeItem('crop_health_token');
    localStorage.removeItem('crop_health_user');
    setUser(null);
    setCurrentAssessment(null);
    setCurrentScreen('landing');
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
  };

  const handleAssessmentCreated = (newAssessment) => {
    setCurrentAssessment(newAssessment);
  };

  const handleSelectAssessment = (item) => {
    setCurrentAssessment(item);
  };

  // Render view depending on screen
  if (currentScreen === 'landing') {
    return (
      <LandingPage
        onNavigate={(target) => {
          if (target === 'login' || target === 'register') {
            setCurrentScreen(target);
          } else if (target === 'dashboard') {
            if (user) {
              setCurrentScreen('dashboard');
            } else {
              setCurrentScreen('login');
            }
          }
        }}
      />
    );
  }

  if (currentScreen === 'login' || currentScreen === 'register') {
    return (
      <AuthPage
        initialMode={currentScreen}
        onAuthSuccess={handleAuthSuccess}
        onNavigate={(target) => {
          if (target === 'home' || target === 'landing') {
            setCurrentScreen('landing');
          } else {
            setCurrentScreen(target);
          }
        }}
      />
    );
  }

  // Farmer Dashboard view
  return (
    <DashboardLayout
      user={user}
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      onLogout={handleLogout}
    >
      {activeTab === 'overview' && (
        <OverviewView
          user={user}
          onNavigateTab={handleSelectTab}
          onSelectAssessment={handleSelectAssessment}
        />
      )}

      {activeTab === 'new-assessment' && (
        <NewAssessmentView
          onAssessmentCreated={handleAssessmentCreated}
          onNavigateTab={handleSelectTab}
        />
      )}

      {activeTab === 'prediction-results' && (
        <PredictionResultsView
          assessment={currentAssessment}
          onNavigateTab={handleSelectTab}
        />
      )}

      {activeTab === 'history' && (
        <AssessmentHistoryView
          onSelectAssessment={handleSelectAssessment}
          onNavigateTab={handleSelectTab}
        />
      )}

      {activeTab === 'analytics' && (
        <CropHealthAnalyticsView />
      )}

      {activeTab === 'profile' && (
        <ProfileSettingsView
          user={user}
          onLogout={handleLogout}
          onUserUpdated={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </DashboardLayout>
  );
}
