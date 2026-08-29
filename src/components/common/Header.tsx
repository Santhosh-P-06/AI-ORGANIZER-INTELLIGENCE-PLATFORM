import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Sparkles,
  Shield,
  UserCheck,
  GraduationCap,
  Bell,
  LogOut,
  LogIn,
  ExternalLink,
  Calendar,
  Layers,
  Award
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
  const {
    currentUser,
    currentRole,
    logout,
    notifications,
    markNotificationRead,
    clearAllNotifications,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleDetails: Record<UserRole, { label: string; icon: any; color: string; bg: string }> = {
    ORGANISER: { label: 'Organiser', icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-950/70 border-indigo-500/30' },
    VOLUNTEER: { label: 'Volunteer', icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-950/70 border-emerald-500/30' },
    STUDENT: { label: 'Participant', icon: GraduationCap, color: 'text-sky-400', bg: 'bg-sky-950/70 border-sky-500/30' },
    ADMIN: { label: 'Admin', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-950/70 border-amber-500/30' },
  };

  const currentRoleInfo = roleDetails[currentRole];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => currentUser ? onGoDashboard?.() : onGoHome()} title={currentUser ? 'Open my dashboard' : 'Go to home'}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-slate-100 tracking-tight">
                AI Event Organiser
              </span>
              <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-300">
                OS Intel
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Intelligent Collegiate Event Platform
            </p>
          </div>
        </div>

        {/* Right Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Dashboard link if on landing/verify view */}
          {currentViewState !== 'DASHBOARD' && (
            <button
              onClick={onGoDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600/90 hover:bg-indigo-600 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              title="Open Role Dashboard"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{currentRole.charAt(0) + currentRole.slice(1).toLowerCase()} Dashboard</span>
            </button>
          )}

          {/* Certificate Public Verification Link */}
          <button
            onClick={onOpenVerification}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition-colors cursor-pointer"
            title="Public Certificate Verification"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Verify Certificate</span>
          </button>

          {/* Authenticated role indicator: roles cannot be switched from the interface. */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${currentRoleInfo.bg} ${currentRoleInfo.color}`}
            title="Your authenticated role"
          >
            <currentRoleInfo.icon className="w-3.5 h-3.5" />
            <span>{currentRoleInfo.label}</span>
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/80 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200">Event Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-800/50 ${
                          !notif.read ? 'bg-indigo-950/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`font-semibold ${!notif.read ? 'text-indigo-300' : 'text-slate-300'}`}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Auth button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400">{currentUser.department}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  onOpenAuth('STUDENT');
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800/80 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('STUDENT')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
