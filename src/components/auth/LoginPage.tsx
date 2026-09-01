'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserPlus,
  UserRound,
  GraduationCap,
  Calendar,
  UserCheck,
  Shield,
  CheckCircle2,
  Sun,
  Moon,
  ChevronRight,
  Zap,
  Award,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

interface LoginPageProps {
  onSuccess: () => void;
}

const ROLES: {
  value: UserRole;
  label: string;
  icon: any;
  desc: string;
  color: string;
  bg: string;
}[] = [
  { value: 'STUDENT',   label: 'Student',   icon: GraduationCap, desc: 'Participant portal',      color: '#0284c7', bg: 'rgba(2,132,199,0.12)' },
  { value: 'ORGANISER', label: 'Organiser', icon: Calendar,      desc: 'Event control center',    color: '#4f46e5', bg: 'rgba(79,70,229,0.12)' },
  { value: 'VOLUNTEER', label: 'Volunteer', icon: UserCheck,     desc: 'Attendance & QR hub',     color: '#059669', bg: 'rgba(5,150,105,0.12)' },
  { value: 'ADMIN',     label: 'Admin',     icon: Shield,        desc: 'Institutional control',   color: '#d97706', bg: 'rgba(217,119,6,0.12)' },
];

const FEATURES = [
  { icon: Zap,          text: 'AI-powered agenda scheduling in seconds' },
  { icon: Award,        text: 'Auto-dispatch verified digital certificates' },
  { icon: BarChart3,    text: 'Real-time event analytics & insights' },
  { icon: TrendingUp,   text: 'Conflict-free jury panel allocation' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, registerUser, switchDemoRole } = useApp();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [message, setMessage] = useState('');
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (tab === 'signup') {
      if (password !== confirmPassword) { setMessage('Passwords do not match.'); return; }
      const r = registerUser({ name, email, password, role });
      if (r.success) onSuccess(); else setMessage(r.message);
      return;
    }
    if (login(email, role, password)) onSuccess();
    else setMessage('Incorrect credentials. Demo password: password123');
  };

  const pwStrength = (p: string) => {
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    return Math.min(s, 4);
  };
  const str = pwStrength(password);
  const strLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  /* ─────────────── Style tokens ─────────────── */
  const cardBg      = isDark ? '#111827' : '#ffffff';
  const pageBg      = isDark ? '#060b14' : '#eef4ff';
  const inputBg     = isDark ? 'rgba(17,24,39,0.8)'  : 'rgba(239,246,255,0.9)';
  const inputBorder = isDark ? 'rgba(99,179,237,0.18)' : 'rgba(37,99,235,0.18)';
  const border      = isDark ? 'rgba(99,179,237,0.10)' : 'rgba(37,99,235,0.10)';
  const tabBarBg    = isDark ? 'rgba(17,24,39,0.7)'   : 'rgba(224,236,255,0.8)';

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 12px 12px 40px',
    borderRadius: '12px',
    border: `1.5px solid ${inputBorder}`,
    background: inputBg,
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: pageBg,
        display: 'flex',
        flexDirection: isWide ? 'row' : 'column',
        transition: 'background 0.3s',
      }}
    >
      {/* ══════════════════════════════════════════
          LEFT PANEL — Brand showcase
      ══════════════════════════════════════════ */}
      <div
        style={{
          flex: isWide ? '0 0 50%' : 'none',
          width: isWide ? '50%' : '100%',
          minHeight: isWide ? '100vh' : '340px',
          background: 'linear-gradient(145deg, #0c1a6b 0%, #1d4ed8 40%, #1e40af 70%, #2e1065 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: isWide ? '56px 56px 48px 56px' : '40px 32px 36px 32px',
          boxSizing: 'border-box',
        }}
      >
        {/* Orb decorations */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)',
          animation: 'spin-slow 12s linear infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '-60px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          animation: 'float 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.20,
          backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
        }} />

        {/* Content wrapper */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: isWide ? '52px' : '32px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.30)',
              flexShrink: 0,
            }}>
              <Sparkles style={{ width: '24px', height: '24px', color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, color: '#fff', fontSize: '20px', lineHeight: 1.2 }}>
                AI Event Organiser
              </div>
              <div style={{ color: 'rgba(191,219,254,0.85)', fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>
                Intelligent Collegiate Platform
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: '"Space Grotesk",sans-serif',
            fontWeight: 800, color: '#fff',
            fontSize: isWide ? '42px' : '28px',
            lineHeight: 1.15,
            letterSpacing: '-0.5px',
            margin: '0 0 16px 0',
          }}>
            Plan Smarter.{' '}
            <span style={{ color: '#bfdbfe' }}>Organise Better.</span>
            <br />Manage Automatically.
          </h1>

          <p style={{
            color: 'rgba(191,219,254,0.80)',
            fontSize: '15px', lineHeight: 1.6,
            margin: '0 0 40px 0',
            maxWidth: '400px',
          }}>
            The all-in-one AI platform for universities to orchestrate events, manage registrations,
            allocate panels, and issue verified certificates — all in one place.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon style={{ width: '18px', height: '18px', color: '#bfdbfe' }} />
                </div>
                <span style={{ color: 'rgba(224,242,254,0.90)', fontSize: '14px', fontWeight: 500 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginTop: '40px',
        }}>
          {[
            { val: '50+',  label: 'Active Events' },
            { val: '2K+',  label: 'Registrations' },
            { val: '100%', label: 'Conflict-Free' },
          ].map(({ val, label }) => (
            <div key={label} style={{
              borderRadius: '16px',
              padding: '18px 12px',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 800, fontSize: '26px', color: '#fff', lineHeight: 1.1 }}>
                {val}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(191,219,254,0.80)', fontWeight: 500, marginTop: '4px' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — Auth Form
      ══════════════════════════════════════════ */}
      <div
        style={{
          flex: isWide ? '0 0 50%' : 'none',
          width: isWide ? '50%' : '100%',
          minHeight: isWide ? '100vh' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark ? '#0d1117' : '#f0f6ff',
          padding: isWide ? '40px 48px' : '32px 20px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Theme toggle */}
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '40px', height: '40px',
              borderRadius: '12px', border: `1px solid ${border}`,
              background: isDark ? 'rgba(17,24,39,0.8)' : 'rgba(255,255,255,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: isDark ? '#fbbf24' : '#2563eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.2s',
            }}
          >
            {isDark ? <Sun style={{ width: '18px', height: '18px' }} /> : <Moon style={{ width: '18px', height: '18px' }} />}
          </button>
        </div>

        {/* Mobile logo */}
        {!isWide && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', alignSelf: 'flex-start' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles style={{ width: '20px', height: '20px', color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, color: 'var(--text-primary)', fontSize: '16px' }}>
                AI Event Organiser
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Intelligent Collegiate Platform
              </div>
            </div>
          </div>
        )}

        {/* Auth Card */}
        <div style={{
          width: '100%',
          maxWidth: '460px',
          background: cardBg,
          borderRadius: '28px',
          padding: '36px 36px',
          border: `1px solid ${border}`,
          boxShadow: isDark
            ? '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,179,237,0.04)'
            : '0 25px 60px rgba(37,99,235,0.10)',
          boxSizing: 'border-box',
        }}>
          {/* Heading */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontFamily: '"Space Grotesk",sans-serif',
              fontWeight: 800, fontSize: '28px',
              color: 'var(--text-primary)',
              margin: '0 0 6px 0', lineHeight: 1.2,
            }}>
              {tab === 'signin' ? 'Welcome back 👋' : 'Create account'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
              {tab === 'signin'
                ? 'Sign in to continue to your role dashboard.'
                : 'Register to access your event workspace.'}
            </p>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', borderRadius: '14px', padding: '5px',
            background: tabBarBg, border: `1px solid ${border}`,
            marginBottom: '24px',
          }}>
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setMessage(''); }}
                style={{
                  flex: 1, padding: '10px 0',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: tab === t
                    ? 'linear-gradient(135deg,#1d4ed8,#2563eb)'
                    : 'transparent',
                  color: tab === t ? '#fff' : 'var(--text-muted)',
                  boxShadow: tab === t ? '0 3px 12px rgba(37,99,235,0.30)' : 'none',
                }}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit}>
            {/* Name */}
            {tab === 'signup' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <UserRound style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-subtle)' }} />
                  <input
                    required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                    onBlur={(e) => (e.target.style.borderColor = inputBorder)}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {tab === 'signup' ? 'Email Address' : 'Email / Roll Number'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-subtle)' }} />
                <input
                  required type={tab === 'signup' ? 'email' : 'text'}
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={tab === 'signup' ? 'name@college.edu' : 'Email or roll number'}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                  onBlur={(e) => (e.target.style.borderColor = inputBorder)}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <LockKeyhole style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-subtle)' }} />
                <input
                  required minLength={6}
                  type={showPw ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                  onBlur={(e) => (e.target.style.borderColor = inputBorder)}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 0 }}>
                  {showPw ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
              {tab === 'signup' && password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1,2,3,4].map((i) => (
                      <div key={i} style={{
                        flex: 1, height: '4px', borderRadius: '99px',
                        background: i <= str ? strColor[str] : isDark ? '#1f2937' : '#e2e8f0',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: strColor[str] || 'var(--text-subtle)' }}>
                    {strLabel[str]} password
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            {tab === 'signup' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <LockKeyhole style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-subtle)' }} />
                  <input
                    required minLength={6}
                    type={showCPw ? 'text' : 'password'}
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    style={{ ...inputStyle, paddingRight: '44px', borderColor: confirmPassword && confirmPassword !== password ? '#ef4444' : inputBorder }}
                    onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                    onBlur={(e) => (e.target.style.borderColor = confirmPassword && confirmPassword !== password ? '#ef4444' : inputBorder)}
                  />
                  <button type="button" onClick={() => setShowCPw(!showCPw)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 0 }}>
                    {showCPw ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>
            )}

            {/* Role Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Workspace Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {ROLES.map(({ value, label, icon: Icon, desc, color, bg }) => {
                  const sel = role === value;
                  return (
                    <button
                      key={value} type="button" onClick={() => setRole(value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '11px 12px',
                        borderRadius: '12px',
                        border: `1.5px solid ${sel ? color : inputBorder}`,
                        background: sel ? bg : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        boxShadow: sel ? `0 0 0 1px ${color}30` : 'none',
                      }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0,
                        background: sel ? color : isDark ? 'rgba(30,41,59,0.6)' : 'rgba(219,234,254,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: sel ? '#fff' : color,
                      }}>
                        <Icon style={{ width: '15px', height: '15px' }} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: sel ? color : 'var(--text-primary)', lineHeight: 1.2 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {desc}
                        </div>
                      </div>
                      {sel && <CheckCircle2 style={{ width: '14px', height: '14px', color, flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            {message && (
              <div style={{
                padding: '12px 14px', borderRadius: '12px', marginBottom: '16px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444', fontSize: '13px', fontWeight: 500,
              }}>
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: '100%', padding: '14px',
                borderRadius: '14px', border: 'none',
                background: 'linear-gradient(135deg,#1d4ed8,#2563eb,#3b82f6)',
                color: '#fff', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 18px rgba(37,99,235,0.40)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 26px rgba(37,99,235,0.50)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px rgba(37,99,235,0.40)';
              }}
            >
              {tab === 'signup' ? <UserPlus style={{ width: '16px', height: '16px' }} /> : <ArrowRight style={{ width: '16px', height: '16px' }} />}
              {tab === 'signin' ? `Enter ${role.charAt(0) + role.slice(1).toLowerCase()} Dashboard` : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            color: 'var(--text-subtle)', fontSize: '12px',
            margin: '20px 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: border }} />
            <span>or continue with demo</span>
            <div style={{ flex: 1, height: '1px', background: border }} />
          </div>

          {/* Quick Access */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {ROLES.map(({ value, label, icon: Icon, color, bg }) => (
              <button
                key={value}
                type="button"
                onClick={() => { switchDemoRole(value); onSuccess(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 12px', borderRadius: '12px',
                  border: `1px solid ${isDark ? 'rgba(99,179,237,0.12)' : `${color}25`}`,
                  background: isDark ? 'rgba(17,24,39,0.5)' : bg,
                  cursor: 'pointer', transition: 'all 0.2s',
                  color,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 14px ${color}25`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}55`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? 'rgba(99,179,237,0.12)' : `${color}25`;
                }}
              >
                <Icon style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>{label}</span>
                <ChevronRight style={{ width: '12px', height: '12px', opacity: 0.5, flexShrink: 0 }} />
              </button>
            ))}
          </div>

          {/* Toggle & hint */}
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '20px', marginBottom: 0 }}>
            {tab === 'signin' ? "New to the platform?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setMessage(''); }}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '13px', cursor: 'pointer', padding: 0 }}
            >
              {tab === 'signin' ? 'Create account' : 'Sign in'}
            </button>
          </p>
          {tab === 'signin' && (
            <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-subtle)', marginTop: '8px', marginBottom: 0 }}>
              Demo accounts use password{' '}
              <code style={{
                fontFamily: '"JetBrains Mono",monospace', padding: '2px 6px',
                borderRadius: '6px', fontSize: '11px',
                background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(219,234,254,0.8)',
                color: '#2563eb',
              }}>
                password123
              </code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
