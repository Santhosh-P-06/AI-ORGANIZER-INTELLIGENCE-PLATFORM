'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';
import {
  Sparkles, Shield, UserCheck, GraduationCap,
  Bell, LogOut, LogIn, Calendar, Layers, Award,
  Sun, Moon, X,
} from 'lucide-react';

interface HeaderProps {
  onOpenAuth: (defaultRole?: UserRole) => void;
  onOpenVerification: () => void;
  onGoHome: () => void;
  onGoDashboard?: () => void;
  currentViewState?: 'LANDING' | 'DASHBOARD' | 'VERIFICATION';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenVerification,
  onGoHome,
  onGoDashboard,
  currentViewState = 'LANDING',
}) => {
  const { currentUser, currentRole, logout, notifications, markNotificationRead, clearAllNotifications } = useApp();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [showNotif, setShowNotif] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const roleInfo: Record<UserRole, { label: string; icon: any; color: string; bgLight: string; bgDark: string }> = {
    ORGANISER: { label: 'Organiser', icon: Calendar,      color: '#4f46e5', bgLight: 'rgba(79,70,229,0.08)',  bgDark: 'rgba(79,70,229,0.15)' },
    VOLUNTEER: { label: 'Volunteer', icon: UserCheck,     color: '#059669', bgLight: 'rgba(5,150,105,0.08)',  bgDark: 'rgba(5,150,105,0.15)' },
    STUDENT:   { label: 'Participant', icon: GraduationCap, color: '#0284c7', bgLight: 'rgba(2,132,199,0.08)', bgDark: 'rgba(2,132,199,0.15)' },
    ADMIN:     { label: 'Admin',     icon: Shield,        color: '#d97706', bgLight: 'rgba(217,119,6,0.08)',  bgDark: 'rgba(217,119,6,0.15)' },
  };
  const ri = roleInfo[currentRole];
  const RoleIcon = ri.icon;

  const headerBg = isDark
    ? `rgba(8,12,20,${scrolled ? 0.98 : 0.90})`
    : `rgba(255,255,255,${scrolled ? 0.98 : 0.88})`;
  const borderColor = isDark ? 'rgba(99,179,237,0.10)' : 'rgba(37,99,235,0.10)';
  const btnBg = isDark ? 'rgba(17,24,39,0.8)' : 'rgba(239,246,255,0.9)';

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px', borderRadius: '10px', cursor: 'pointer',
    border: `1px solid ${borderColor}`, background: btnBg,
    color: 'var(--text-muted)', transition: 'all 0.2s', flexShrink: 0,
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50, width: '100%',
      background: headerBg,
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: `1px solid ${borderColor}`,
      boxShadow: scrolled ? (isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(37,99,235,0.08)') : 'none',
      transition: 'all 0.3s',
    }}>
      {/* Inner — max-width centered, full height bar */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        {/* ── Brand ── */}
        <div
          onClick={() => currentUser ? onGoDashboard?.() : onGoHome()}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg,#1d4ed8,#2563eb,#4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37,99,235,0.30)',
          }}>
            <Sparkles style={{ width: '20px', height: '20px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700,
                fontSize: '17px', color: 'var(--text-primary)', letterSpacing: '-0.3px',
              }}>
                AI Event Organiser
              </span>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em',
                padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase',
                background: isDark ? 'rgba(37,99,235,0.15)' : 'rgba(219,234,254,0.8)',
                border: `1px solid ${isDark ? 'rgba(99,179,237,0.20)' : 'rgba(37,99,235,0.20)'}`,
                color: isDark ? '#93c5fd' : '#1d4ed8',
                display: 'none',
              }} className="sm-show">
                OS Intel
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Intelligent Collegiate Platform
            </p>
          </div>
        </div>

        {/* ── Right Controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

          {/* Dashboard Link */}
          {currentViewState !== 'DASHBOARD' && currentUser && (
            <button
              onClick={onGoDashboard}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
                background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
                color: '#fff', border: 'none',
                fontSize: '12px', fontWeight: 700,
                boxShadow: '0 3px 12px rgba(37,99,235,0.30)',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              <Layers style={{ width: '14px', height: '14px' }} />
              <span>{currentRole.charAt(0) + currentRole.slice(1).toLowerCase()} Dashboard</span>
            </button>
          )}

          {/* Verify Certificate (Hidden on Organiser view) */}
          {currentRole !== 'ORGANISER' && (
            <button
              onClick={onOpenVerification}
              style={{ ...btnStyle, padding: '8px 14px', gap: '6px' }}
            >
              <Award style={{ width: '14px', height: '14px', color: '#d97706' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>Verify Cert</span>
            </button>
          )}

          {/* Role Badge */}
          {currentUser && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '10px',
              background: isDark ? ri.bgDark : ri.bgLight,
              border: `1px solid ${ri.color}30`,
              fontSize: '12px', fontWeight: 600, color: ri.color,
              whiteSpace: 'nowrap',
            }}>
              <RoleIcon style={{ width: '13px', height: '13px' }} />
              <span>{ri.label}</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button onClick={toggleTheme} style={btnStyle} title={isDark ? 'Light Mode' : 'Dark Mode'}>
            {isDark
              ? <Sun style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
              : <Moon style={{ width: '16px', height: '16px', color: '#2563eb' }} />
            }
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button onClick={() => setShowNotif(!showNotif)} style={{ ...btnStyle, position: 'relative' }}>
              <Bell style={{ width: '16px', height: '16px' }} />
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
                  color: '#fff', fontSize: '9px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unread}
                </span>
              )}
            </button>

            {showNotif && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                width: '360px', borderRadius: '20px', overflow: 'hidden',
                background: isDark ? '#0f172a' : '#ffffff',
                border: `1px solid ${borderColor}`,
                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(37,99,235,0.15)',
                zIndex: 100,
              }}>
                {/* Header */}
                <div style={{
                  padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: `1px solid ${borderColor}`,
                  background: isDark ? 'rgba(17,24,39,0.6)' : 'rgba(239,246,255,0.7)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell style={{ width: '14px', height: '14px', color: '#2563eb' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
                    {unread > 0 && (
                      <span style={{ padding: '2px 7px', borderRadius: '99px', background: '#2563eb', color: '#fff', fontSize: '10px', fontWeight: 700 }}>
                        {unread}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {unread > 0 && (
                      <button onClick={clearAllNotifications} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
                      <X style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '13px' }}>
                      No notifications yet
                    </div>
                  ) : notifications.map((n) => (
                    <div key={n.id} onClick={() => markNotificationRead(n.id)}
                      style={{
                        padding: '12px 16px', cursor: 'pointer',
                        borderBottom: `1px solid ${borderColor}`,
                        background: !n.read ? (isDark ? 'rgba(37,99,235,0.08)' : 'rgba(239,246,255,0.8)') : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {!n.read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />}
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-subtle)', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, paddingLeft: n.read ? 0 : '12px' }}>
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User / Login */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '13px', fontWeight: 800, flexShrink: 0,
              }}>
                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <button
                onClick={() => { logout(); onOpenAuth('STUDENT'); }}
                style={{ ...btnStyle }}
                title="Logout"
              >
                <LogOut style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('STUDENT')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 16px', borderRadius: '12px', cursor: 'pointer',
                background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
                color: '#fff', border: 'none',
                fontSize: '13px', fontWeight: 700,
                boxShadow: '0 3px 12px rgba(37,99,235,0.35)',
                transition: 'all 0.2s',
              }}
            >
              <LogIn style={{ width: '14px', height: '14px' }} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
