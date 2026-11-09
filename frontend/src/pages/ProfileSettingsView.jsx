import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Save,
  LogOut,
  CheckCircle2,
  Camera,
  AlertCircle,
  KeyRound
} from 'lucide-react';

export default function ProfileSettingsView({ user, onLogout, onUserUpdated }) {
  const [fullName, setFullName] = useState(user?.fullName || '');

  // Profile avatar selection
  const [selectedAvatar, setSelectedAvatar] = useState('farmer_1');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status indicators
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Sync avatar from user prop on mount / change
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      const av = user.avatar;
      if (av) {
        if (av.startsWith('data:image') || av.startsWith('http') || av.startsWith('/')) {
          setSelectedAvatar('custom');
          setCustomAvatarUrl(av);
        } else {
          setSelectedAvatar(av);
        }
      }
    }
  }, [user]);

  const AVATARS = [
    { id: 'farmer_1', label: '👨‍🌾 Farmer', emoji: '👨‍🌾' },
    { id: 'farmer_2', label: '👩‍🌾 Grower', emoji: '👩‍🌾' },
    { id: 'sprout', label: '🌱 Sprout', emoji: '🌱' },
    { id: 'tree', label: '🌳 Orchard', emoji: '🌳' },
    { id: 'sun', label: '☀️ Solar', emoji: '☀️' },
    { id: 'greenhouse', label: '🏡 Greenhouse', emoji: '🏡' }
  ];

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProfileErrorMsg('Image size exceeds 2MB limit. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCustomAvatarUrl(reader.result);
        setSelectedAvatar('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setProfileErrorMsg('Please enter a valid full name (at least 2 characters).');
      return;
    }

    setProfileLoading(true);
    const finalAvatar = selectedAvatar === 'custom' ? customAvatarUrl : selectedAvatar;

    try {
      const token = localStorage.getItem('crop_health_token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          avatar: finalAvatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      // Update local storage and app state
      const updatedUser = {
        ...user,
        fullName: data.fullName,
        avatar: data.avatar
      };
      localStorage.setItem('crop_health_user', JSON.stringify(updatedUser));
      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }

      setProfileSuccessMsg('Profile details and picture updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      setProfileErrorMsg(err.message || 'Error occurred while saving profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!currentPassword) {
      setPasswordErrorMsg('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirm password do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem('crop_health_token');
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setPasswordSuccessMsg('Password successfully changed in database! Please use your new password next time you sign in.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(''), 6000);
    } catch (err) {
      setPasswordErrorMsg(err.message || 'Error occurred while updating password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const renderActiveAvatarPreview = () => {
    if (selectedAvatar === 'custom' && customAvatarUrl) {
      return (
        <img
          src={customAvatarUrl}
          alt="Avatar Preview"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      );
    }
    const matched = AVATARS.find((a) => a.id === selectedAvatar);
    if (matched) {
      return matched.emoji;
    }
    return fullName ? fullName[0].toUpperCase() : 'G';
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <span className="section-tag">ACCOUNT SETTINGS</span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Profile & Password
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Update your grower profile, photo avatar, or change your account login password.
        </p>
      </div>

      {/* Profile Details Form */}
      <form
        onSubmit={handleSaveProfile}
        style={{
          background: '#ffffff',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.8rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <User size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Personal Information & Avatar
          </h2>
        </div>

        {profileSuccessMsg && (
          <div
            style={{
              padding: '0.9rem 1.1rem',
              background: '#dcfce7',
              border: '1.5px solid #bbf7d0',
              borderRadius: 'var(--radius-sm)',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.92rem',
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={18} />
            <span>{profileSuccessMsg}</span>
          </div>
        )}

        {profileErrorMsg && (
          <div
            style={{
              padding: '0.9rem 1.1rem',
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.92rem',
              fontWeight: 500
            }}
          >
            <AlertCircle size={18} />
            <span>{profileErrorMsg}</span>
          </div>
        )}

        {/* Profile Picture / Avatar Selector */}
        <div>
          <label className="form-label" style={{ marginBottom: '0.8rem' }}>
            Choose Profile Picture / Avatar
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: selectedAvatar === 'custom' && customAvatarUrl ? '#f0fdf4' : 'var(--primary-soft)',
                border: '3px solid var(--primary)',
                color: 'var(--primary-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: selectedAvatar === 'custom' ? '1rem' : '2.2rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(27, 94, 32, 0.2)',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {renderActiveAvatarPreview()}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.id)}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    border: selectedAvatar === av.id ? '2px solid var(--primary)' : '1.5px solid var(--border-light)',
                    background: selectedAvatar === av.id ? 'var(--primary-soft)' : 'var(--bg-main)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {av.label}
                </button>
              ))}

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  border: selectedAvatar === 'custom' ? '2px solid var(--primary)' : '1.5px solid var(--border-light)',
                  background: selectedAvatar === 'custom' ? 'var(--primary-soft)' : 'var(--bg-main)',
                  color: 'var(--primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Camera size={15} />
                <span>Upload Photo</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              </label>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            Full Name <span className="required-star">*</span>
          </label>
          <input
            type="text"
            required
            className="form-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        {/* Email (Readonly) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Email Address (Registered Account)</label>
          <input
            type="email"
            disabled
            className="form-input"
            value={user?.email || 'grower@agrovita.com'}
            style={{ background: 'var(--bg-main)', color: 'var(--text-muted)' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={profileLoading}
            className="btn-primary"
            style={{ padding: '11px 26px', fontSize: '0.95rem', gap: '8px', opacity: profileLoading ? 0.7 : 1 }}
          >
            <Save size={16} />
            <span>{profileLoading ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>

      {/* Change Password Form */}
      <form
        onSubmit={handleUpdatePassword}
        style={{
          background: '#ffffff',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <KeyRound size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Change Account Password
          </h2>
        </div>

        {passwordSuccessMsg && (
          <div
            style={{
              padding: '0.9rem 1.1rem',
              background: '#dcfce7',
              border: '1.5px solid #bbf7d0',
              borderRadius: 'var(--radius-sm)',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.92rem',
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={18} />
            <span>{passwordSuccessMsg}</span>
          </div>
        )}

        {passwordErrorMsg && (
          <div
            style={{
              padding: '0.9rem 1.1rem',
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.92rem',
              fontWeight: 500
            }}
          >
            <AlertCircle size={18} />
            <span>{passwordErrorMsg}</span>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            Current Password <span className="required-star">*</span>
          </label>
          <input
            type="password"
            required
            className="form-input"
            placeholder="Enter your existing account password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            New Password <span className="required-star">*</span> (at least 8 characters)
          </label>
          <input
            type="password"
            required
            className="form-input"
            placeholder="Enter new strong password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            Confirm New Password <span className="required-star">*</span>
          </label>
          <input
            type="password"
            required
            className="form-input"
            placeholder="Re-type new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={passwordLoading}
            className="btn-primary"
            style={{ padding: '11px 26px', fontSize: '0.95rem', gap: '8px', opacity: passwordLoading ? 0.7 : 1 }}
          >
            <Lock size={16} />
            <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </form>

      {/* Sign Out Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Sign Out of AgroVita AI
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Safely close your active farm session on this device.
          </p>
        </div>

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.4rem',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: 'var(--radius-full)',
            border: '1px solid #fecaca',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
