'use client';

import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  X, Lock, Mail, Shield, GraduationCap, UserCheck, Calendar,
  Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle,
  ArrowRight, Zap, ChevronRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  onSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen, onClose, initialRole = 'STUDENT', onSuccess,
}) => {
  const { login, switchDemoRole } = useApp();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && initialRole) { setSelectedRole(initialRole); setError(null); }
  }, [isOpen, initialRole]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const configs: Record<UserRole, { title: string; subtitle: string; fieldLabel: string; placeholder: string; icon: any; defaultUser: string; color: string; bg: string; features: string[] }> = {
    STUDENT:   { title: 'Student Portal Sign In',       subtitle: 'Browse events, generate QR passes, download certificates', fieldLabel: 'College Email / Roll Number', placeholder: 'student@college.edu or 21CS042', icon: GraduationCap, defaultUser: '21CS042',              color: '#0284c7', bg: 'rgba(2,132,199,0.10)',   features: ['Event Registration','Dynamic QR Badges','Live Schedules','E-Certificates'] },
    ORGANISER: { title: 'Organiser Control Center',     subtitle: 'Create events, generate AI agendas, manage jury panels',  fieldLabel: 'Faculty Email / Organiser ID', placeholder: 'organiser@college.edu',      icon: Calendar,      defaultUser: 'organiser@college.edu', color: '#4f46e5', bg: 'rgba(79,70,229,0.10)',  features: ['AI Agenda Scheduling','Smart Form Builder','Panel Allocation','Live Tracking'] },
    VOLUNTEER: { title: 'Volunteer Operations Hub',     subtitle: 'Fast QR scanning, attendance check-ins, round monitoring',fieldLabel: 'Volunteer Email / Roll No',    placeholder: 'volunteer@college.edu',      icon: UserCheck,     defaultUser: 'volunteer@college.edu', color: '#059669', bg: 'rgba(5,150,105,0.10)',  features: ['QR Scanner','Arrival Logging','Roster View','Round Updates'] },
    ADMIN:     { title: 'Institutional Administration', subtitle: 'System auditing, quota governance, access control',       fieldLabel: 'Administrator ID / Email',    placeholder: 'ADM-101 or admin@college.edu',icon: Shield,       defaultUser: 'ADM-101',              color: '#d97706', bg: 'rgba(217,119,6,0.10)',  features: ['User Management','Audit Logs','Metrics','Access Control'] },
  };

  const quickNames: Record<UserRole, string> = {
    STUDENT: 'Rahul K • 21CS042', ORGANISER: 'Prof. Rajesh • CSE Lead',
    VOLUNTEER: 'Priya V • QR Lead', ADMIN: 'Dr. Vance • Dean',
  };
  const quickEmoji: Record<UserRole, string> = { STUDENT: '🎓', ORGANISER: '📅', VOLUNTEER: '🤝', ADMIN: '🛡️' };

  const cfg = configs[selectedRole];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    const input = identifier.trim() || cfg.defaultUser;
    login(input, selectedRole) || switchDemoRole(selectedRole);
    onSuccess(selectedRole); onClose();
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault(); if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
    setTimeout(() => { setForgotSuccess(false); setShowForgot(false); setForgotEmail(''); }, 2500);
  };

  /* ── Styles ── */
  const modalBg   = isDark ? '#0f172a' : '#ffffff';
  const headerBg  = isDark ? 'rgba(8,12,20,0.7)' : 'rgba(239,246,255,0.8)';
  const border    = isDark ? 'rgba(99,179,237,0.12)' : 'rgba(37,99,235,0.10)';
  const inputBg   = isDark ? 'rgba(17,24,39,0.8)'   : 'rgba(239,246,255,0.7)';
  const inputBorder = isDark ? 'rgba(99,179,237,0.18)' : 'rgba(37,99,235,0.18)';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 11px 11px 38px',
    borderRadius: '12px', border: `1.5px solid ${inputBorder}`,
    background: inputBg, color: 'var(--text-primary)',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        background: isDark ? 'rgba(0,0,0,0.80)' : 'rgba(15,23,42,0.60)',
        backdropFilter: 'blur(14px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: '520px',
          background: modalBg, borderRadius: '28px',
          border: `1px solid ${border}`,
          boxShadow: isDark
            ? '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,179,237,0.05)'
            : '0 30px 80px rgba(37,99,235,0.16)',
          overflow: 'hidden', maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          animation: 'scaleIn 0.25s ease',
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', zIndex: 10,
          width: '32px', height: '32px', borderRadius: '10px', border: `1px solid ${border}`,
          background: isDark ? 'rgba(17,24,39,0.8)' : 'rgba(239,246,255,0.9)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)',
        }}>
          <X style={{ width: '15px', height: '15px' }} />
        </button>

        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: `1px solid ${border}`, background: headerBg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '9px', background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles style={{ width: '14px', height: '14px', color: '#fff' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2563eb' }}>
              Role-Based Authentication
            </span>
          </div>
          <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '19px', color: 'var(--text-primary)', margin: '0 0 6px' }}>
            {cfg.title}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.6 }}>
            {cfg.subtitle}
          </p>

          {/* Role Tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px',
            padding: '5px', borderRadius: '14px',
            background: isDark ? 'rgba(8,12,20,0.6)' : 'rgba(255,255,255,0.7)',
            border: `1px solid ${border}`,
          }}>
            {(['STUDENT','ORGANISER','VOLUNTEER','ADMIN'] as UserRole[]).map((r) => {
              const c = configs[r]; const Icon = c.icon; const sel = selectedRole === r;
              return (
                <button key={r} type="button"
                  onClick={() => { setSelectedRole(r); setIdentifier(''); setError(null); setShowForgot(false); }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                    padding: '10px 4px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: sel ? c.color : 'transparent',
                    color: sel ? '#fff' : 'var(--text-muted)',
                    fontSize: '11px', fontWeight: 700, transition: 'all 0.2s',
                    boxShadow: sel ? `0 3px 10px ${c.color}45` : 'none',
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '10px', lineHeight: 1 }}>
                    {r === 'ORGANISER' ? 'Organiser' : r === 'VOLUNTEER' ? 'Volunteer' : r === 'STUDENT' ? 'Student' : 'Admin'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Error */}
          {error && (
            <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Role Highlights */}
          <div style={{ padding: '14px 16px', borderRadius: '16px', background: isDark ? cfg.bg.replace('0.10', '0.15') : cfg.bg, border: `1px solid ${cfg.color}28` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <cfg.icon style={{ width: '14px', height: '14px', color: cfg.color }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Target: {selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()} Dashboard
                </span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '99px', background: `${cfg.color}18`, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
                Active Role
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {cfg.features.map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 style={{ width: '12px', height: '12px', color: '#2563eb', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          {!showForgot ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Identifier */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>{cfg.fieldLabel}</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--text-subtle)' }} />
                  <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={cfg.placeholder} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#2563eb')} onBlur={(e) => (e.target.style.borderColor = inputBorder)} />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                  <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--text-subtle)' }} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" style={{ ...inputStyle, paddingRight: '40px' }}
                    onFocus={(e) => (e.target.style.borderColor = '#2563eb')} onBlur={(e) => (e.target.style.borderColor = inputBorder)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 0 }}>
                    {showPassword ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: '#2563eb', width: '14px', height: '14px' }} />
                Remember me on this device
              </label>

              {/* Submit */}
              <button type="submit" style={{
                width: '100%', padding: '13px 16px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg,${cfg.color},${cfg.color}cc)`,
                color: '#fff', fontSize: '13px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: `0 4px 16px ${cfg.color}40`, transition: 'all 0.2s',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 22px ${cfg.color}55`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${cfg.color}40`; }}
              >
                Enter {selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()} Dashboard
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '12px', background: isDark ? 'rgba(17,24,39,0.6)' : 'rgba(239,246,255,0.8)', border: `1px solid ${border}`, fontSize: '12px', color: 'var(--text-secondary)' }}>
                Enter your institutional email to receive a secure password recovery link.
              </div>
              {forgotSuccess && (
                <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.25)', color: '#059669', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                  Recovery link sent to {forgotEmail}!
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--text-subtle)' }} />
                  <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="your.email@college.edu" style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#2563eb')} onBlur={(e) => (e.target.style.borderColor = inputBorder)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowForgot(false)} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: `1px solid ${border}`, background: isDark ? 'rgba(17,24,39,0.6)' : 'rgba(239,246,255,0.8)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Back to Sign In
                </button>
                <button type="submit" style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.35)' }}>
                  Send Reset Link
                </button>
              </div>
            </form>
          )}

          {/* Quick Launch */}
          <div style={{ paddingTop: '16px', borderTop: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Zap style={{ width: '13px', height: '13px', color: '#f59e0b' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                One-Click Instant Launch
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {(['STUDENT','ORGANISER','VOLUNTEER','ADMIN'] as UserRole[]).map((r) => {
                const c = configs[r];
                return (
                  <button key={r} type="button"
                    onClick={() => { switchDemoRole(r); onSuccess(r); onClose(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 12px', borderRadius: '12px',
                      border: `1px solid ${border}`,
                      background: isDark ? 'rgba(8,12,20,0.6)' : 'rgba(239,246,255,0.7)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = isDark ? c.bg : c.bg;
                      (e.currentTarget as HTMLButtonElement).style.borderColor = `${c.color}50`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(8,12,20,0.6)' : 'rgba(239,246,255,0.7)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = border;
                    }}
                  >
                    <span style={{ fontSize: '16px', lineHeight: 1 }}>{quickEmoji[r]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: c.color, lineHeight: 1.2 }}>
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {quickNames[r]}
                      </div>
                    </div>
                    <ChevronRight style={{ width: '12px', height: '12px', color: c.color, opacity: 0.6, flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
