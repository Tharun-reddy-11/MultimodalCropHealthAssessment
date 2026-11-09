import React, { useState, useEffect } from 'react';
import {
  Sprout,
  LayoutDashboard,
  PlusCircle,
  CheckCircle,
  History,
  TrendingUp,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sunset
} from 'lucide-react';

export default function DashboardLayout({ user, onLogout, activeTab, onSelectTab, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [timeGreeting, setTimeGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState(Sun);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      const displayName = user?.fullName ? user.fullName.split(' ')[0] : 'Grower';

      if (hour >= 5 && hour < 12) {
        setTimeGreeting(`Good Morning, ${displayName}`);
        setGreetingIcon(Sun);
      } else if (hour >= 12 && hour < 17) {
        setTimeGreeting(`Good Afternoon, ${displayName}`);
        setGreetingIcon(Sun);
      } else if (hour >= 17 && hour < 21) {
        setTimeGreeting(`Good Evening, ${displayName}`);
        setGreetingIcon(Sunset);
      } else {
        setTimeGreeting(`Welcome, ${displayName}`);
        setGreetingIcon(Moon);
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Farmer-focused navigation list (Technical researcher items removed)
  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'new-assessment', label: 'Check Crop Health', icon: PlusCircle },
    { id: 'prediction-results', label: 'Diagnosis Results', icon: CheckCircle },
    { id: 'history', label: 'Past Crop Checks', icon: History },
    { id: 'analytics', label: 'Crop Health Trends', icon: TrendingUp },
    { id: 'profile', label: 'Profile & Settings', icon: User }
  ];

  const GreetingIconComponent = greetingIcon;

  const renderAvatar = () => {
    const avatar = user?.avatar;
    if (avatar) {
      if (avatar.startsWith('data:image') || avatar.startsWith('http') || avatar.startsWith('/')) {
        return (
          <img
            src={avatar}
            alt={user?.fullName || 'User'}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #2e7d32',
              boxShadow: '0 2px 8px rgba(27, 94, 32, 0.2)',
              cursor: 'pointer'
            }}
            onClick={() => onSelectTab('profile')}
            title="View Profile & Settings"
          />
        );
      }
      const emojiMap = {
        farmer_1: '👨‍🌾',
        farmer_2: '👩‍🌾',
        sprout: '🌱',
        tree: '🌳',
        sun: '☀️',
        greenhouse: '🏡'
      };
      if (emojiMap[avatar]) {
        return (
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#e8f5e9',
              border: '2px solid #2e7d32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 2px 8px rgba(27, 94, 32, 0.2)',
              cursor: 'pointer'
            }}
            onClick={() => onSelectTab('profile')}
            title="View Profile & Settings"
          >
            {emojiMap[avatar]}
          </div>
        );
      }
    }
    return (
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '1.1rem',
          boxShadow: '0 2px 8px rgba(27, 94, 32, 0.2)',
          cursor: 'pointer'
        }}
        onClick={() => onSelectTab('profile')}
        title="View Profile & Settings"
      >
        {user?.fullName ? user.fullName[0].toUpperCase() : 'G'}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!collapsed ? (
            <div className="brand" style={{ fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => onSelectTab('overview')}>
              <img
                src="/logo.png"
                alt="AgroVita AI"
                style={{ width: '34px', height: '34px', objectFit: 'contain' }}
              />
              <span>AgroVita <span style={{ color: 'var(--primary-light)' }}>AI</span></span>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src="/logo.png"
                alt="AgroVita AI"
                style={{ width: '28px', height: '28px', objectFit: 'contain', cursor: 'pointer' }}
                onClick={() => setCollapsed(false)}
              />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: 'var(--text-muted)', padding: '6px', borderRadius: '6px', background: 'var(--bg-main)' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : ''}
              >
                <Icon size={20} color={isActive ? '#1b5e20' : '#4a5d52'} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-item"
            onClick={onLogout}
            style={{ color: '#dc2626' }}
            title={collapsed ? 'Log Out' : ''}
          >
            <LogOut size={20} color="#dc2626" style={{ flexShrink: 0 }} />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="dashboard-main">
        {/* Top Navbar */}
        <header className="dashboard-topbar">
          <div className="greeting-pill">
            <GreetingIconComponent size={20} color="#1b5e20" />
            <span>{timeGreeting}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{ textAlign: 'right', cursor: 'pointer' }}
              onClick={() => onSelectTab('profile')}
              title="View Profile & Settings"
            >
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.fullName || 'Grower'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {user?.email || 'grower@agrovita.com'}
              </div>
            </div>

            {renderAvatar()}
          </div>
        </header>

        {/* Content Area */}
        <section className="dashboard-content">
          {children}
        </section>
      </main>
    </div>
  );
}
