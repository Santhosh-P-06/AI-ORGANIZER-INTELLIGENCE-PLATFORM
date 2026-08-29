import React, { useState } from 'react';
import { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Lock,
  Mail,
  Shield,
  GraduationCap,
  UserCheck,
  Calendar,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  onSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'STUDENT',
  onSuccess,
}) => {
  const { login, switchDemoRole } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Update selected role if initialRole changes when opening
  React.useEffect(() => {
    if (isOpen && initialRole) {
      setSelectedRole(initialRole);
      setError(null);
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const roleConfigs: Record<
    UserRole,
    {
      title: string;
      subtitle: string;
      fieldLabel: string;
      fieldPlaceholder: string;
      icon: any;
      defaultUser: string;
      defaultName: string;
      color: string;
      bg: string;
      badgeColor: string;
      gradient: string;
      features: string[];
    }
  > = {
    STUDENT: {
      title: 'Student Portal Sign In',
      subtitle: 'Browse college events, generate smart QR passes, and download verified certificates',
      fieldLabel: 'Student College Email / Roll Number',
      fieldPlaceholder: 'student@college.edu or 21CS042',
      icon: GraduationCap,
      defaultUser: '21CS042',
      defaultName: 'Rahul K (3rd Year CSE)',
      color: 'text-sky-400',
      bg: 'bg-sky-600 hover:bg-sky-500',
      badgeColor: 'bg-sky-950/70 border-sky-500/30 text-sky-300',
      gradient: 'from-sky-500/20 to-blue-500/10 border-sky-500/30',
      features: ['Event Registration', 'Dynamic QR Badges', 'Live Schedules', 'Verified E-Certificates'],
    },
    ORGANISER: {
      title: 'Organiser Control Center',
      subtitle: 'Create events, generate AI minute-by-minute agendas, and manage jury panels',
      fieldLabel: 'Institutional Faculty Email / Organiser ID',
      fieldPlaceholder: 'organiser@college.edu',
      icon: Calendar,
      defaultUser: 'organiser@college.edu',
      defaultName: 'Prof. Rajesh (CSE Coordinator)',
      color: 'text-indigo-400',
      bg: 'bg-indigo-600 hover:bg-indigo-500',
      badgeColor: 'bg-indigo-950/70 border-indigo-500/30 text-indigo-300',
      gradient: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30',
      features: ['AI Agenda Scheduling', 'Smart Form Builder', 'Panel Matrix Allocation', 'Live Evaluation Tracking'],
    },
    VOLUNTEER: {
      title: 'Volunteer Operations Hub',
      subtitle: 'Fast QR barcode scanning, attendance check-ins, and venue round monitoring',
      fieldLabel: 'Volunteer Email / Student Roll No',
      fieldPlaceholder: 'volunteer@college.edu or 22IT019',
      icon: UserCheck,
      defaultUser: 'volunteer@college.edu',
      defaultName: 'Priya V (Attendance Lead)',
      color: 'text-emerald-400',
      bg: 'bg-emerald-600 hover:bg-emerald-500',
      badgeColor: 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300',
      gradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      features: ['High-Speed QR Scanner', 'Arrival Time Logging', 'Roster Slot View', 'Round Status Updates'],
    },
    ADMIN: {
      title: 'Institutional Administration',
      subtitle: 'System auditing, department quota governance, and platform access control',
      fieldLabel: 'Administrator ID / Master Email',
      fieldPlaceholder: 'ADM-101 or admin@college.edu',
      icon: Shield,
      defaultUser: 'ADM-101',
      defaultName: 'Dr. Arthur Vance (Dean of Academics)',
      color: 'text-amber-400',
      bg: 'bg-amber-600 hover:bg-amber-500',
      badgeColor: 'bg-amber-950/70 border-amber-500/30 text-amber-300',
      gradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
      features: ['User Management', 'Real-Time Audit Logs', 'Institutional Metrics', 'Access Governance'],
    },
  };

  const currentConfig = roleConfigs[selectedRole];

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setIdentifier('');
    setError(null);
    setShowForgotPassword(false);
  };

  const handleDirectQuickLogin = (role: UserRole) => {
    switchDemoRole(role);
    onSuccess(role);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const input = identifier.trim() || currentConfig.defaultUser;
    const ok = login(input, selectedRole);

    if (ok) {
      onSuccess(selectedRole);
      onClose();
    } else {
      // Fallback to demo switch if custom id wasn't typed exactly
      switchDemoRole(selectedRole);
      onSuccess(selectedRole);
      onClose();
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setShowForgotPassword(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              Role-Based Authentication
            </span>
          </div>
          <h2 className="text-xl font-display font-bold text-slate-100">{currentConfig.title}</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {currentConfig.subtitle}
          </p>

          {/* Primary 4 Role Choices Bar */}
          <div className="grid grid-cols-4 gap-1.5 mt-4 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
            {(['STUDENT', 'ORGANISER', 'VOLUNTEER', 'ADMIN'] as UserRole[]).map((r) => {
              const cfg = roleConfigs[r];
              const Icon = cfg.icon;
              const isSelected = selectedRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleTabChange(r)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? `${cfg.bg} text-white shadow-lg`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] tracking-tight">
                    {r === 'ORGANISER' ? 'Organiser' : r === 'VOLUNTEER' ? 'Volunteer' : r === 'STUDENT' ? 'Student' : 'Admin'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Feature Highlights */}
          <div className={`p-3.5 rounded-xl border bg-gradient-to-r ${currentConfig.gradient}`}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <currentConfig.icon className={`w-4 h-4 ${currentConfig.color}`} />
                <span className="text-xs font-bold text-slate-200">
                  Target Dashboard: {selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}
                </span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${currentConfig.badgeColor}`}>
                Active Role
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
              {currentConfig.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {currentConfig.fieldLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={currentConfig.fieldPlaceholder}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              {/* Instant Action Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 ${currentConfig.bg} cursor-pointer`}
              >
                <span>Enter {selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                Enter your institutional email ID to receive a secure password recovery link.
              </div>

              {forgotSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password recovery link sent successfully to {forgotEmail}!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your.email@college.edu"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          )}

          {/* 1-Click Direct Launch Bar for all 4 roles */}
          <div className="pt-4 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Instant Dashboard Launch</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDirectQuickLogin('STUDENT')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500/40 text-left text-xs transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 group-hover:text-sky-300">🎓 Student</span>
                  <ArrowRight className="w-3 h-3 text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Rahul K • 21CS042</div>
              </button>

              <button
                type="button"
                onClick={() => handleDirectQuickLogin('ORGANISER')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-left text-xs transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-400 group-hover:text-indigo-300">📅 Organiser</span>
                  <ArrowRight className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Prof. Rajesh • CSE Lead</div>
              </button>

              <button
                type="button"
                onClick={() => handleDirectQuickLogin('VOLUNTEER')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-left text-xs transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 group-hover:text-emerald-300">🤝 Volunteer</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Priya V • QR Lead</div>
              </button>

              <button
                type="button"
                onClick={() => handleDirectQuickLogin('ADMIN')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-left text-xs transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 group-hover:text-amber-300">🛡️ Admin</span>
                  <ArrowRight className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Dr. Vance • Dean</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

