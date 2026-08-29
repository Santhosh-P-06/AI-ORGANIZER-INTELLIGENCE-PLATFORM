import React, { useState } from 'react';
import { UserRole } from '../types';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Award,
  Shield,
  GraduationCap,
  UserCheck,
  ArrowRight,
  Search,
  Check,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (role?: UserRole) => void;
  onOpenVerification: (initialCertId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onOpenVerification,
}) => {
  const { events, registrations, certificates, currentUser } = useApp();
  const [searchCertId, setSearchCertId] = useState('');

  const totalEvents = events.length;
  const totalRegs = registrations.length;
  const totalCerts = certificates.length;

  const roles = [
    {
      role: 'ORGANISER' as UserRole,
      title: 'Organiser Control Center',
      icon: Calendar,
      desc: 'Create events, generate AI agendas & forms, allocate panels, oversee live rounds, and auto-dispatch certificates.',
      color: 'border-indigo-500/40 hover:border-indigo-400 bg-indigo-950/20',
      btnColor: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    },
    {
      role: 'VOLUNTEER' as UserRole,
      title: 'Volunteer Duty Hub',
      icon: UserCheck,
      desc: 'Access your assigned time slots, scan student QR badges for instant attendance, and track live round progression.',
      color: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    },
    {
      role: 'STUDENT' as UserRole,
      title: 'Participant Portal',
      icon: GraduationCap,
      desc: 'Browse college events, register with smart forms, retrieve QR check-in badges, view schedules, and download certificates.',
      color: 'border-sky-500/40 hover:border-sky-400 bg-sky-950/20',
      btnColor: 'bg-sky-600 hover:bg-sky-500 text-white',
    },
    {
      role: 'ADMIN' as UserRole,
      title: 'Institutional Admin',
      icon: Shield,
      desc: 'Approve organiser permissions, manage department quotas, monitor platform usage metrics, and audit system logs.',
      color: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/20',
      btnColor: 'bg-amber-600 hover:bg-amber-500 text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span>Next-Generation College Event Operating System</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-100 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          AI Event Organiser <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Intelligence Assistant
          </span>
        </h1>

        <p className="mt-4 text-lg sm:text-xl font-medium text-slate-300 max-w-2xl mx-auto">
          “Plan Smarter. Organise Better. Manage Automatically.”
        </p>

        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The all-in-one AI platform engineered for universities and institutions to orchestrate student registrations, AI agenda scheduling, conflict-free panel allocation, QR attendance, and automated verified certificate issuance.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onOpenAuth('ORGANISER')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer"
          >
            <span>Sign in to Event OS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenAuth()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition-all cursor-pointer"
          >
            <span>Login to Role</span>
          </button>
        </div>

        {/* Live Counters */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-display font-bold text-indigo-400">{totalEvents}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Active College Events</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-display font-bold text-sky-400">{totalRegs}+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Student Registrations</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Conflict-Free Panels</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-display font-bold text-amber-400">{totalCerts}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Verified E-Certificates</div>
          </div>
        </div>
      </section>

      {/* Role Selection Launchpad */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-100">
            Four Dedicated Role Workspaces
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose your role to explore the tailored intelligence environment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                className={`p-6 rounded-2xl border ${item.color} backdrop-blur-sm flex flex-col justify-between transition-all hover:scale-[1.02] shadow-lg`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-slate-200" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => onOpenAuth(item.role)}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${item.btnColor}`}
                  >
                    <span>Sign in as {item.role === 'STUDENT' ? 'participant' : item.role.charAt(0) + item.role.slice(1).toLowerCase()}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Public Certificate Verification Quick Lookup Box */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                <span>Instant Credential Verification</span>
              </div>
              <h3 className="text-xl font-display font-bold text-slate-100">
                Verify Any Issued Certificate Online
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Enter a unique Certificate ID (e.g. <span className="font-mono text-indigo-300">CERT-TH-2026-8801</span>) to check authentic status and participant validation without logins.
              </p>
            </div>
            <div className="w-full md:w-auto flex-1 max-w-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchCertId.trim()) {
                    onOpenVerification(searchCertId.trim());
                  } else {
                    onOpenVerification();
                  }
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchCertId}
                    onChange={(e) => setSearchCertId(e.target.value)}
                    placeholder="e.g. CERT-TH-2026-8801"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer"
                >
                  Verify Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">AI Event Organiser Intelligence Assistant</span>
          </div>
          <div>
            Built for Colleges, Universities & Technical Institutions • Full-Stack OS
          </div>
        </div>
      </footer>
    </div>
  );
};
