'use client';

import React, { useState } from 'react';
import { UserRole } from '../types';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles, Calendar, Award, Shield,
  GraduationCap, UserCheck, ArrowRight, Search,
  Zap, BarChart3, Users, TrendingUp, CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (role?: UserRole) => void;
  onOpenVerification: (initialCertId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onOpenVerification }) => {
  const { events, registrations, certificates } = useApp();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchCertId, setSearchCertId] = useState('');

  /* ── Colors ── */
  const pageBg   = isDark ? '#060b14' : '#f0f6ff';
  const cardBg   = isDark ? 'rgba(17,24,39,0.8)'  : 'rgba(255,255,255,0.95)';
  const border   = isDark ? 'rgba(99,179,237,0.10)' : 'rgba(37,99,235,0.10)';
  const inputBg  = isDark ? 'rgba(8,12,20,0.8)'   : 'rgba(255,255,255,0.9)';
  const shadow   = isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 20px rgba(37,99,235,0.08)';

  /* ── Inner content max-width wrapper style ── */
  const section: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    width: '100%',
    boxSizing: 'border-box',
  };

  const roles = [
    { role: 'ORGANISER' as UserRole, title: 'Organiser Control Center', icon: Calendar,      color: '#4f46e5', bg: 'rgba(79,70,229,0.08)',  border: 'rgba(79,70,229,0.20)' },
    { role: 'VOLUNTEER' as UserRole, title: 'Volunteer Duty Hub',       icon: UserCheck,     color: '#059669', bg: 'rgba(5,150,105,0.08)',  border: 'rgba(5,150,105,0.20)' },
    { role: 'STUDENT'   as UserRole, title: 'Participant Portal',       icon: GraduationCap, color: '#0284c7', bg: 'rgba(2,132,199,0.08)',  border: 'rgba(2,132,199,0.20)' },
    { role: 'ADMIN'     as UserRole, title: 'Institutional Admin',      icon: Shield,        color: '#d97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.20)' },
  ];

  const features = [
    { icon: Zap,          title: 'AI Agenda Builder',     desc: 'Generate minute-by-minute event schedules with one click using Gemini AI.' },
    { icon: Users,        title: 'Smart Registration',    desc: 'Customizable forms with automatic validation and QR badge generation.' },
    { icon: BarChart3,    title: 'Live Analytics',        desc: 'Real-time dashboard with attendance, round status, and participation metrics.' },
    { icon: Award,        title: 'Auto Certificates',     desc: 'Verified digital certificates auto-dispatched after event completion.' },
    { icon: TrendingUp,   title: 'Panel Allocation',      desc: 'Conflict-free jury matrix with AI-powered schedule optimization.' },
    { icon: CheckCircle2, title: 'QR Attendance',         desc: 'High-speed QR code scanning for instant student check-in and logging.' },
  ];

  const stats = [
    { val: `${events.length}`,        label: 'Active Events',         color: '#2563eb' },
    { val: `${registrations.length}+`,label: 'Registrations',         color: '#059669' },
    { val: '100%',                    label: 'Conflict-Free Panels',   color: '#4f46e5' },
    { val: `${certificates.length}`,  label: 'E-Certificates',         color: '#d97706' },
  ];

  const roleDescs: Record<UserRole, string> = {
    ORGANISER: 'Create events, generate AI agendas & forms, allocate panels, oversee live rounds, and auto-dispatch certificates.',
    VOLUNTEER: 'Access assigned time slots, scan student QR badges for instant attendance, and track live round progression.',
    STUDENT:   'Browse college events, register with smart forms, retrieve QR check-in badges, view schedules, and download certificates.',
    ADMIN:     'Approve organiser permissions, manage department quotas, monitor platform usage metrics, and audit system logs.',
  };

  return (
    <div style={{ background: pageBg, minHeight: '100vh', color: 'var(--text-primary)', transition: 'background 0.3s' }}>

      {/* ─────────────────────────────────────
          HERO
      ───────────────────────────────────── */}
      <div style={{ padding: '72px 0 64px' }}>
        <div style={{ ...section, textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 18px', borderRadius: '99px',
              background: isDark ? 'rgba(37,99,235,0.12)' : 'rgba(219,234,254,0.8)',
              border: `1px solid ${isDark ? 'rgba(99,179,237,0.20)' : 'rgba(37,99,235,0.20)'}`,
            }}>
              <Sparkles style={{ width: '14px', height: '14px', color: '#2563eb' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#93c5fd' : '#1d4ed8', letterSpacing: '0.02em' }}>
                Next-Generation College Event Operating System
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: '"Space Grotesk",sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(32px,5vw,60px)',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            letterSpacing: '-1px',
            margin: '0 auto 20px',
            maxWidth: '800px',
          }}>
            AI Event Organiser{' '}
            <span style={{
              background: 'linear-gradient(135deg,#1d4ed8,#2563eb,#4f46e5)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Intelligence Assistant
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px,2vw,20px)', fontWeight: 600,
            color: 'var(--text-secondary)', margin: '0 auto 12px', maxWidth: '600px',
          }}>
            "Plan Smarter. Organise Better. Manage Automatically."
          </p>
          <p style={{
            fontSize: '15px', color: 'var(--text-muted)',
            lineHeight: 1.7, margin: '0 auto 44px', maxWidth: '640px',
          }}>
            The all-in-one AI platform for universities to orchestrate student registrations,
            AI agenda scheduling, conflict-free panel allocation, QR attendance, and automated
            verified certificate issuance.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '64px' }}>
            <button
              onClick={() => onOpenAuth('ORGANISER')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', borderRadius: '14px',
                background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: '15px', fontWeight: 700,
                boxShadow: '0 4px 20px rgba(37,99,235,0.40)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 30px rgba(37,99,235,0.50)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(37,99,235,0.40)'; }}
            >
              <span>Sign in to Event OS</span>
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={() => onOpenAuth()}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', borderRadius: '14px',
                background: isDark ? 'rgba(17,24,39,0.8)' : 'rgba(255,255,255,0.95)',
                color: 'var(--text-secondary)', border: `1.5px solid ${border}`,
                cursor: 'pointer', fontSize: '15px', fontWeight: 600,
                boxShadow: shadow, transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
            >
              Login to Role
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            maxWidth: '800px',
            margin: '0 auto',
          }}>
            {stats.map(({ val, label, color }, i) => (
              <div key={i} style={{
                background: cardBg, border: `1px solid ${border}`,
                borderRadius: '20px', padding: '24px 16px', textAlign: 'center',
                boxShadow: shadow, transition: 'transform 0.2s',
              }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)')}
              >
                <div style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 800, fontSize: '30px', color, lineHeight: 1.1 }}>
                  {val}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginTop: '6px' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────
          ROLE CARDS
      ───────────────────────────────────── */}
      <div style={{ padding: '64px 0' }}>
        <div style={section}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 800, fontSize: 'clamp(26px,3vw,38px)', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Four Dedicated Role Workspaces
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0 }}>
              Choose your role to explore the tailored intelligence environment
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {roles.map(({ role, title, icon: Icon, color, bg, border: rb }) => (
              <div
                key={role}
                style={{
                  background: isDark ? `rgba(17,24,39,0.7)` : bg,
                  border: `1.5px solid ${isDark ? `${color}30` : rb}`,
                  borderRadius: '24px', padding: '28px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  boxShadow: shadow, transition: 'all 0.25s', cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = 'translateY(-6px)';
                  el.style.boxShadow = `0 16px 40px ${color}22, 0 4px 16px rgba(0,0,0,0.1)`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = shadow;
                }}
              >
                <div>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: color, boxShadow: `0 6px 16px ${color}45`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    <Icon style={{ width: '26px', height: '26px', color: '#fff' }} />
                  </div>
                  <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 10px' }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                    {roleDescs[role]}
                  </p>
                </div>
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${isDark ? `${color}20` : rb}` }}>
                  <button
                    onClick={() => onOpenAuth(role)}
                    style={{
                      width: '100%', padding: '11px 16px',
                      borderRadius: '12px', border: 'none', cursor: 'pointer',
                      background: color, color: '#fff',
                      fontSize: '13px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      boxShadow: `0 4px 14px ${color}40`, transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 20px ${color}55`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 14px ${color}40`; }}
                  >
                    Sign in as {role === 'STUDENT' ? 'Participant' : role.charAt(0) + role.slice(1).toLowerCase()}
                    <ArrowRight style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────
          FEATURES GRID
      ───────────────────────────────────── */}
      <div style={{ padding: '64px 0' }}>
        <div style={section}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 800, fontSize: 'clamp(26px,3vw,38px)', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Everything You Need
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0 }}>
              Built with AI at the core for modern collegiate event management
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} style={{
                background: cardBg, border: `1px solid ${border}`,
                borderRadius: '20px', padding: '28px',
                boxShadow: shadow, transition: 'transform 0.2s',
              }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)')}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px', marginBottom: '18px',
                  background: isDark ? 'rgba(37,99,235,0.15)' : 'rgba(219,234,254,0.8)',
                  border: `1px solid ${isDark ? 'rgba(99,179,237,0.20)' : 'rgba(37,99,235,0.15)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                </div>
                <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', margin: '0 0 8px' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────
          CERT VERIFICATION
      ───────────────────────────────────── */}
      <div style={{ padding: '64px 0' }}>
        <div style={{ ...section, maxWidth: '860px' }}>
          <div style={{
            padding: '48px 52px',
            borderRadius: '28px',
            background: isDark
              ? 'linear-gradient(135deg,rgba(17,24,39,0.9),rgba(30,27,75,0.7))'
              : 'linear-gradient(135deg,rgba(239,246,255,0.95),rgba(219,234,254,0.7))',
            border: `1.5px solid ${isDark ? 'rgba(99,179,237,0.15)' : 'rgba(37,99,235,0.15)'}`,
            boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.4)' : '0 24px 60px rgba(37,99,235,0.12)',
            display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center',
          }}>
            {/* Text */}
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0,
                  background: 'linear-gradient(135deg,#d97706,#f59e0b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Award style={{ width: '18px', height: '18px', color: '#fff' }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d97706' }}>
                  Instant Credential Verification
                </span>
              </div>
              <h3 style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 10px' }}>
                Verify Any Issued Certificate Online
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                Enter a Certificate ID — e.g.{' '}
                <code style={{
                  fontFamily: '"JetBrains Mono",monospace', fontSize: '12px',
                  padding: '2px 7px', borderRadius: '6px',
                  background: isDark ? 'rgba(37,99,235,0.15)' : 'rgba(219,234,254,0.8)',
                  color: '#2563eb',
                }}>
                  CERT-TH-2026-8801
                </code>{' '}
                — to check authentic status without login.
              </p>
            </div>

            {/* Search */}
            <div style={{ flex: '1 1 280px' }}>
              <form onSubmit={(e) => { e.preventDefault(); onOpenVerification(searchCertId.trim() || undefined); }}
                style={{ display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--text-subtle)' }} />
                  <input
                    type="text" value={searchCertId} onChange={(e) => setSearchCertId(e.target.value)}
                    placeholder="e.g. CERT-TH-2026-8801"
                    style={{
                      width: '100%', padding: '13px 13px 13px 38px',
                      borderRadius: '12px', fontSize: '13px',
                      background: inputBg,
                      border: `1.5px solid ${border}`,
                      color: 'var(--text-primary)', outline: 'none',
                      boxSizing: 'border-box', transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                    onBlur={(e) => (e.target.style.borderColor = border)}
                  />
                </div>
                <button type="submit" style={{
                  padding: '13px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#d97706,#f59e0b)',
                  color: '#fff', fontSize: '13px', fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(217,119,6,0.35)',
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}>
                  Verify Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────
          FOOTER
      ───────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${border}`,
        background: isDark ? 'rgba(6,11,20,0.9)' : 'rgba(240,246,255,0.95)',
        padding: '32px 24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles style={{ width: '16px', height: '16px', color: '#fff' }} />
            </div>
            <span style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
              AI Event Organiser Intelligence Assistant
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Built for Colleges, Universities & Technical Institutions • Full-Stack OS
          </div>
        </div>
      </footer>
    </div>
  );
};
