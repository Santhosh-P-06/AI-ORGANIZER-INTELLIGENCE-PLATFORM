'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useTheme } from '../../../context/ThemeContext';
import { AttendanceStatus, TeamMember, Registration } from '../../../types';
import {
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Clock,
  MapPin,
  Mail,
  Phone,
  Layers,
  Sparkles,
  Activity,
  Award,
  Users,
  UserPlus,
  RefreshCw,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  History,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VolunteerDashboard: React.FC = () => {
  const {
    events,
    activeEventId,
    setActiveEventId,
    currentUser,
    registrations,
    markParticipantAttendance,
    replaceTeamMember,
    updateRoundTracking,
  } = useApp();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'INCOMPLETE_TEAMS' | 'ROUNDS' | 'SCHEDULE'>('ATTENDANCE');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LATE' | 'INCOMPLETE' | 'REPLACED'>('ALL');
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});

  // Replacement Modal State
  const [replacingReg, setReplacingReg] = useState<Registration | null>(null);
  const [replacingMember, setReplacingMember] = useState<TeamMember | null>(null);
  const [newName, setNewName] = useState('');
  const [newRoll, setNewRoll] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newYear, setNewYear] = useState('3rd Year (Junior)');
  const [newSection, setNewSection] = useState('Sec-A');
  const [replaceReason, setReplaceReason] = useState('');
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [replaceSuccess, setReplaceSuccess] = useState<string | null>(null);

  // Quick Action Feedback
  const [actionNotice, setActionNotice] = useState<{ id: string; text: string; type: 'success' | 'warn' } | null>(null);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const eventRegs = activeEvent ? registrations.filter((r) => r.eventId === activeEvent.id) : [];

  // Find volunteer assignment in this event
  const myAssignment = activeEvent?.volunteerAssignments?.find(
    (va) =>
      va.volunteerEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
      va.volunteerName?.toLowerCase() === currentUser?.name?.toLowerCase()
  ) || {
    role: 'Participant Attendance & Check-In Desk Lead',
    assignedLocation: 'Auditorium Main Entry Gate',
    timeSlot: '08:30 AM - 01:00 PM',
    status: 'CHECKED_IN',
  };

  // Stats calculation
  const totalCount = eventRegs.length;
  const presentCount = eventRegs.filter((r) => r.attendance?.attended && r.attendance?.status !== 'LATE').length;
  const lateCount = eventRegs.filter((r) => r.attendance?.status === 'LATE').length;
  const absentCount = eventRegs.filter((r) => !r.attendance?.attended).length;
  const replacedCount = eventRegs.reduce((acc, r) => acc + (r.replacementHistory?.length || 0), 0);
  const incompleteTeams = eventRegs.filter((r) => r.teamEligibility === 'INCOMPLETE_TEAM');
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  const toggleExpand = (regId: string) => {
    setExpandedTeams((prev) => ({ ...prev, [regId]: !prev[regId] }));
  };

  const handleMarkStatus = (regId: string, status: AttendanceStatus, memberId?: string, memberName?: string) => {
    markParticipantAttendance(regId, status, memberId);
    
    if (status === 'PRESENT' || status === 'LATE') {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }

    setActionNotice({
      id: regId,
      text: `${memberName ? `${memberName} marked` : 'Marked'} ${status}`,
      type: status === 'PRESENT' || status === 'LATE' ? 'success' : 'warn',
    });

    setTimeout(() => setActionNotice(null), 3000);
  };

  const openReplaceModal = (reg: Registration, member: TeamMember) => {
    setReplacingReg(reg);
    setReplacingMember(member);
    setNewName('');
    setNewRoll('');
    setNewEmail('');
    setNewPhone('');
    setNewDept(member.department || 'Computer Science & Engineering');
    setNewYear(member.year || '3rd Year (Junior)');
    setNewSection(member.section || 'Sec-A');
    setReplaceReason('');
    setReplaceError(null);
    setReplaceSuccess(null);
  };

  const handleExecuteReplacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingReg || !replacingMember) return;

    if (!newName.trim() || !newRoll.trim() || !newEmail.trim() || !replaceReason.trim()) {
      setReplaceError('Please fill out all required replacement fields and reason.');
      return;
    }

    const result = replaceTeamMember(
      replacingReg.id,
      replacingMember.id,
      {
        name: newName.trim(),
        rollNumber: newRoll.trim().toUpperCase(),
        email: newEmail.trim().toLowerCase(),
        phone: newPhone.trim(),
        department: newDept,
        year: newYear,
        section: newSection,
      },
      replaceReason.trim()
    );

    if (result.success) {
      setReplaceSuccess(result.message);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
      setTimeout(() => {
        setReplacingReg(null);
        setReplacingMember(null);
      }, 1600);
    } else {
      setReplaceError(result.message);
    }
  };

  const filteredRegs = eventRegs.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.teamName && r.teamName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.membersList && r.membersList.some((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())));

    if (!matchesSearch) return false;

    if (statusFilter === 'PRESENT') return r.attendance?.attended && r.attendance?.status !== 'LATE';
    if (statusFilter === 'LATE') return r.attendance?.status === 'LATE';
    if (statusFilter === 'ABSENT') return !r.attendance?.attended;
    if (statusFilter === 'INCOMPLETE') return r.teamEligibility === 'INCOMPLETE_TEAM';
    if (statusFilter === 'REPLACED') return (r.replacementHistory?.length || 0) > 0;

    return true;
  });

  return (
    <div className="min-h-screen pb-16 transition-colors duration-300" style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)' }}>
      {/* Top Banner */}
      <div className="border-b" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surface-base)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider" style={{ backgroundColor: 'var(--role-volunteer-bg)', color: 'var(--role-volunteer-color)', border: `1px solid ${isDark ? 'rgba(5,150,105,0.3)' : 'rgba(5,150,105,0.2)'}` }}>
                  Volunteer Operations Desk
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{currentUser?.name}</span>
                {activeEvent?.isRosterFinalized && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Roster Finalized
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {activeEvent?.title || 'Collegiate Event Attendance Hub'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--role-volunteer-color)' }}>
                  <MapPin className="w-3.5 h-3.5" /> Station: {myAssignment.assignedLocation}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-500" /> Slot: {myAssignment.timeSlot}
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Active Present: {presentCount + lateCount} / {totalCount} ({attendanceRate}%)
                </span>
              </div>
            </div>

            {/* Event Switcher */}
            <div className="flex items-center gap-2 border rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
              <Layers className="w-4 h-4 text-emerald-500" />
              <select
                value={activeEventId}
                onChange={(e) => setActiveEventId(e.target.value)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id} style={{ backgroundColor: 'var(--surface-base)', color: 'var(--text-primary)' }}>
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 mt-6 border-t pt-4 overflow-x-auto" style={{ borderColor: 'var(--border-default)' }}>
            <button
              onClick={() => setActiveTab('ATTENDANCE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ATTENDANCE'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'hover:bg-slate-500/10'
              }`}
              style={{ color: activeTab === 'ATTENDANCE' ? '#ffffff' : 'var(--text-secondary)' }}
            >
              <UserCheck className="w-4 h-4" />
              <span>Participant Attendance Roster ({totalCount})</span>
            </button>

            <button
              onClick={() => { setActiveTab('INCOMPLETE_TEAMS'); setStatusFilter('INCOMPLETE'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'INCOMPLETE_TEAMS'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'hover:bg-slate-500/10'
              }`}
              style={{ color: activeTab === 'INCOMPLETE_TEAMS' ? '#ffffff' : 'var(--text-secondary)' }}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Incomplete Teams ({incompleteTeams.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ROUNDS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ROUNDS'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'hover:bg-slate-500/10'
              }`}
              style={{ color: activeTab === 'ROUNDS' ? '#ffffff' : 'var(--text-secondary)' }}
            >
              <Activity className="w-4 h-4" />
              <span>Round Stage Tracking</span>
            </button>

            <button
              onClick={() => setActiveTab('SCHEDULE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SCHEDULE'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'hover:bg-slate-500/10'
              }`}
              style={{ color: activeTab === 'SCHEDULE' ? '#ffffff' : 'var(--text-secondary)' }}
            >
              <Calendar className="w-4 h-4" />
              <span>Event Timeline & Roster Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* Real-time KPI Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl border transition-all" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>Total Enrolled</div>
            <div className="text-xl font-bold font-display mt-0.5" style={{ color: 'var(--text-primary)' }}>{totalCount}</div>
            <div className="text-[10px] text-slate-400">All registered</div>
          </div>

          <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="text-[11px] font-semibold text-emerald-500">Present (On-Time)</div>
            <div className="text-xl font-bold font-display text-emerald-500 mt-0.5">{presentCount}</div>
            <div className="text-[10px] text-slate-400">Checked in</div>
          </div>

          <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="text-[11px] font-semibold text-amber-500">Late Arrivals</div>
            <div className="text-xl font-bold font-display text-amber-500 mt-0.5">{lateCount}</div>
            <div className="text-[10px] text-slate-400">Marked late</div>
          </div>

          <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="text-[11px] font-semibold text-rose-500">Absent / No-Show</div>
            <div className="text-xl font-bold font-display text-rose-500 mt-0.5">{absentCount}</div>
            <div className="text-[10px] text-slate-400">Unreported</div>
          </div>

          <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="text-[11px] font-semibold text-indigo-500">Replaced Members</div>
            <div className="text-xl font-bold font-display text-indigo-500 mt-0.5">{replacedCount}</div>
            <div className="text-[10px] text-slate-400">Substitutions</div>
          </div>

          <div className="p-3.5 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="text-[11px] font-semibold text-sky-500">Attendance Rate</div>
            <div className="text-xl font-bold font-display text-sky-500 mt-0.5">{attendanceRate}%</div>
            <div className="text-[10px] text-slate-400">Eligible ratio</div>
          </div>
        </div>

        {/* Global Action Feedback Notice */}
        {actionNotice && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border animate-fade-in ${
            actionNotice.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionNotice.text}</span>
            </div>
            <span className="text-[10px] opacity-70">Audit logged in system</span>
          </div>
        )}

        {/* TAB 1: PARTICIPANT ATTENDANCE ROSTER & CHECK-IN DESK */}
        {(activeTab === 'ATTENDANCE' || activeTab === 'INCOMPLETE_TEAMS') && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student name, roll number, team name..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none border transition-all"
                  style={{
                    backgroundColor: 'var(--surface-raised)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {[
                  { key: 'ALL', label: 'All Roster' },
                  { key: 'PRESENT', label: `Present (${presentCount})` },
                  { key: 'LATE', label: `Late (${lateCount})` },
                  { key: 'ABSENT', label: `Absent (${absentCount})` },
                  { key: 'INCOMPLETE', label: `Incomplete Teams (${incompleteTeams.length})` },
                  { key: 'REPLACED', label: `Replaced (${replacedCount})` },
                ].map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => setStatusFilter(chip.key as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      statusFilter === chip.key
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'border hover:bg-slate-500/10'
                    }`}
                    style={
                      statusFilter === chip.key
                        ? {}
                        : { borderColor: 'var(--border-default)', color: 'var(--text-secondary)', backgroundColor: 'var(--surface-raised)' }
                    }
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Attendance Roster List */}
            <div className="space-y-3">
              {filteredRegs.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
                  <Users className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                  <div className="font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>No participants found</div>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or status filters.</p>
                </div>
              ) : (
                filteredRegs.map((reg) => {
                  const isExpanded = Boolean(expandedTeams[reg.id]);
                  const members = reg.membersList || [
                    {
                      id: `single_${reg.id}`,
                      name: reg.studentName,
                      rollNumber: reg.rollNumber,
                      email: reg.email,
                      phone: reg.phone,
                      department: reg.department,
                      year: reg.year,
                      section: reg.section,
                      attendanceStatus: reg.attendance?.status || (reg.attendance?.attended ? 'PRESENT' : 'ABSENT'),
                      isActive: true,
                      isLead: true,
                    },
                  ];

                  const isTeam = Boolean(reg.teamName && members.length > 1);
                  const activeMembers = members.filter((m) => m.attendanceStatus !== 'REPLACED' && m.attendanceStatus !== 'WITHDRAWN');
                  const presentMembers = activeMembers.filter((m) => m.attendanceStatus === 'PRESENT' || m.attendanceStatus === 'LATE');
                  const teamAttended = reg.attendance?.attended;

                  return (
                    <div
                      key={reg.id}
                      className="rounded-2xl border transition-all duration-200 overflow-hidden"
                      style={{
                        backgroundColor: 'var(--surface-base)',
                        borderColor: reg.teamEligibility === 'INCOMPLETE_TEAM'
                          ? 'rgba(217,119,6,0.35)'
                          : teamAttended
                          ? 'rgba(5,150,105,0.25)'
                          : 'var(--border-default)',
                      }}
                    >
                      {/* Main Summary Row */}
                      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
                            style={{
                              backgroundColor: teamAttended ? 'rgba(5,150,105,0.12)' : 'rgba(239,68,68,0.12)',
                              color: teamAttended ? '#059669' : '#ef4444',
                              border: `1px solid ${teamAttended ? 'rgba(5,150,105,0.25)' : 'rgba(239,68,68,0.25)'}`,
                            }}
                          >
                            {isTeam ? <Users className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {reg.teamName || reg.studentName}
                              </span>

                              {isTeam && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/30">
                                  Team • {activeMembers.length} Members
                                </span>
                              )}

                              {/* Eligibility Badge */}
                              {reg.teamEligibility === 'INCOMPLETE_TEAM' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Incomplete Squad ({presentMembers.length}/{activeEvent.teamSizeMin || 2} Present)
                                </span>
                              ) : teamAttended ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> {reg.attendance?.status === 'LATE' ? 'Late Arrival' : 'Verified Present'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/30 flex items-center gap-1">
                                  <XCircle className="w-3 h-3" /> Absent / No-Show
                                </span>
                              )}

                              {reg.replacementHistory && reg.replacementHistory.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/30 flex items-center gap-1">
                                  <History className="w-3 h-3" /> {reg.replacementHistory.length} Substitution
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                              <span className="font-mono font-semibold" style={{ color: '#0284c7' }}>{reg.rollNumber}</span>
                              <span>•</span>
                              <span>{reg.studentName} (Lead)</span>
                              <span>•</span>
                              <span>{reg.department}</span>
                              {reg.attendance?.timestamp && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-500">Checked in at {new Date(reg.attendance.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Controls */}
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={() => handleMarkStatus(reg.id, 'PRESENT', undefined, reg.studentName)}
                            className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            style={{
                              backgroundColor: reg.attendance?.status === 'PRESENT' ? '#059669' : 'rgba(5,150,105,0.12)',
                              color: reg.attendance?.status === 'PRESENT' ? '#ffffff' : '#059669',
                              border: `1px solid ${reg.attendance?.status === 'PRESENT' ? '#059669' : 'rgba(5,150,105,0.3)'}`,
                            }}
                            title="Mark entire team Present"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMarkStatus(reg.id, 'LATE', undefined, reg.studentName)}
                            className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            style={{
                              backgroundColor: reg.attendance?.status === 'LATE' ? '#d97706' : 'rgba(217,119,6,0.12)',
                              color: reg.attendance?.status === 'LATE' ? '#ffffff' : '#d97706',
                              border: `1px solid ${reg.attendance?.status === 'LATE' ? '#d97706' : 'rgba(217,119,6,0.3)'}`,
                            }}
                            title="Mark Late Arrival"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Late</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMarkStatus(reg.id, 'ABSENT', undefined, reg.studentName)}
                            className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            style={{
                              backgroundColor: !teamAttended ? '#ef4444' : 'rgba(239,68,68,0.12)',
                              color: !teamAttended ? '#ffffff' : '#ef4444',
                              border: `1px solid ${!teamAttended ? '#ef4444' : 'rgba(239,68,68,0.3)'}`,
                            }}
                            title="Mark Absent"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>

                          {isTeam && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(reg.id)}
                              className="p-1.5 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
                              style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                              title="Toggle individual members roster"
                            >
                              <span>{isExpanded ? 'Hide' : 'Members'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Team Members List & Replacement Actions */}
                      {isTeam && isExpanded && (
                        <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surface-raised)' }}>
                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                            <span>Squad Members Roster & Substitution Controls</span>
                            <span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>
                              Minimum {activeEvent.teamSizeMin || 2} Present required for judging eligibility
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {members.map((member) => {
                              const isReplaced = member.attendanceStatus === 'REPLACED';
                              const isMemberPresent = member.attendanceStatus === 'PRESENT' || member.attendanceStatus === 'LATE';

                              return (
                                <div
                                  key={member.id}
                                  className="p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all"
                                  style={{
                                    backgroundColor: isReplaced ? 'rgba(100,116,139,0.06)' : 'var(--surface-base)',
                                    borderColor: isReplaced
                                      ? 'rgba(148,163,184,0.2)'
                                      : isMemberPresent
                                      ? 'rgba(5,150,105,0.25)'
                                      : 'var(--border-default)',
                                    opacity: isReplaced ? 0.65 : 1,
                                  }}
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="font-bold text-xs flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                                          <span>{member.name}</span>
                                          {member.isLead && (
                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/15 text-sky-600 border border-sky-500/30">
                                              Team Lead
                                            </span>
                                          )}
                                          {member.isReplacementMember && (
                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                                              Active Replacement
                                            </span>
                                          )}
                                        </div>
                                        <div className="font-mono text-[11px] text-sky-500 mt-0.5">{member.rollNumber}</div>
                                        <div className="text-[10px] text-slate-400">{member.email} • {member.department}</div>
                                      </div>

                                      {/* Member Status Badge */}
                                      <span
                                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                        style={{
                                          backgroundColor:
                                            member.attendanceStatus === 'PRESENT'
                                              ? 'rgba(5,150,105,0.15)'
                                              : member.attendanceStatus === 'LATE'
                                              ? 'rgba(217,119,6,0.15)'
                                              : member.attendanceStatus === 'REPLACED'
                                              ? 'rgba(148,163,184,0.2)'
                                              : 'rgba(239,68,68,0.15)',
                                          color:
                                            member.attendanceStatus === 'PRESENT'
                                              ? '#059669'
                                              : member.attendanceStatus === 'LATE'
                                              ? '#d97706'
                                              : member.attendanceStatus === 'REPLACED'
                                              ? '#64748b'
                                              : '#ef4444',
                                        }}
                                      >
                                        {member.attendanceStatus}
                                      </span>
                                    </div>

                                    {member.replacementInfo && (
                                      <div className="mt-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-600">
                                        Substituted by <strong>{member.replacementInfo.replacedByName}</strong>: {member.replacementInfo.reason}
                                      </div>
                                    )}

                                    {member.replacedOriginalMemberName && (
                                      <div className="mt-2 text-[10px] text-slate-400">
                                        Replaced original member: {member.replacedOriginalMemberName} ({member.replacedOriginalMemberRoll})
                                      </div>
                                    )}
                                  </div>

                                  {/* Member Level Quick Actions */}
                                  {!isReplaced && (
                                    <div className="flex items-center gap-1.5 pt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
                                      <button
                                        type="button"
                                        onClick={() => handleMarkStatus(reg.id, 'PRESENT', member.id, member.name)}
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                          member.attendanceStatus === 'PRESENT' ? 'bg-emerald-600 text-white' : 'border hover:bg-emerald-500/10 text-emerald-600'
                                        }`}
                                      >
                                        <Check className="w-3 h-3" /> Present
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleMarkStatus(reg.id, 'LATE', member.id, member.name)}
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                          member.attendanceStatus === 'LATE' ? 'bg-amber-600 text-white' : 'border hover:bg-amber-500/10 text-amber-600'
                                        }`}
                                      >
                                        <Clock className="w-3 h-3" /> Late
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleMarkStatus(reg.id, 'ABSENT', member.id, member.name)}
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                          member.attendanceStatus === 'ABSENT' ? 'bg-rose-600 text-white' : 'border hover:bg-rose-500/10 text-rose-600'
                                        }`}
                                      >
                                        <X className="w-3 h-3" /> Absent
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => openReplaceModal(reg, member)}
                                        className="py-1 px-2.5 rounded-lg text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer flex items-center gap-1"
                                        title="Replace this absent member with a new participant"
                                      >
                                        <UserPlus className="w-3 h-3" /> Replace
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ROUND PROGRESSION TRACKING */}
        {activeTab === 'ROUNDS' && (
          <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div>
              <h2 className="text-base font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                Live Round Stage Evaluation Progression
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track round completion for attending teams. Only active participants from the roster are eligible for round qualification.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-default)' }}>
              <table className="w-full text-left text-xs">
                <thead className="border-b uppercase text-[10px] tracking-wider" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
                  <tr>
                    <th className="p-3.5">Team / Participant</th>
                    <th className="p-3.5">Attendance Status</th>
                    <th className="p-3.5 text-center">Round 1 (Pitch)</th>
                    <th className="p-3.5 text-center">Round 2 (Tech)</th>
                    <th className="p-3.5 text-center">Final Presentation</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
                  {eventRegs.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{reg.teamName || reg.studentName}</div>
                        <div className="text-[10px] text-slate-400">{reg.rollNumber} • {reg.department}</div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          reg.attendance?.attended ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {reg.attendance?.attended ? 'Present' : 'Absent'}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => updateRoundTracking(reg.id, 'round1Completed', !reg.roundTracking.round1Completed)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            reg.roundTracking.round1Completed ? 'bg-indigo-600 text-white' : 'border text-slate-400 hover:bg-slate-500/10'
                          }`}
                        >
                          {reg.roundTracking.round1Completed ? 'Done ✓' : 'Mark'}
                        </button>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => updateRoundTracking(reg.id, 'round2Completed', !reg.roundTracking.round2Completed)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            reg.roundTracking.round2Completed ? 'bg-purple-600 text-white' : 'border text-slate-400 hover:bg-slate-500/10'
                          }`}
                        >
                          {reg.roundTracking.round2Completed ? 'Done ✓' : 'Mark'}
                        </button>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => updateRoundTracking(reg.id, 'finalPresentation', !reg.roundTracking.finalPresentation)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            reg.roundTracking.finalPresentation ? 'bg-amber-600 text-white' : 'border text-slate-400 hover:bg-slate-500/10'
                          }`}
                        >
                          {reg.roundTracking.finalPresentation ? 'Done ✓' : 'Mark'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EVENT TIMELINE & ROSTER INFO */}
        {activeTab === 'SCHEDULE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Event Agenda & Attendance Checkpoints</h3>
              </div>

              <div className="space-y-3">
                {activeEvent?.agenda?.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border flex items-start justify-between gap-3" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                    <div>
                      <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{item.activity}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.time} • {item.venue}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Lead: {item.responsiblePerson}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Roster Protocol & Guidelines</h3>
              </div>

              <div className="space-y-3 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                  <div className="font-bold text-emerald-500 mb-1">1. Member Replacement Policy</div>
                  If a team member has an emergency, use the <strong>Replace</strong> button. The replacement participant's details immediately become active for attendance, scheduling, and certificate issuance.
                </div>

                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                  <div className="font-bold text-amber-500 mb-1">2. Incomplete Squads</div>
                  Teams must meet the minimum size requirement ({activeEvent?.teamSizeMin || 2} members) to qualify for jury scoring and final awards.
                </div>

                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                  <div className="font-bold text-indigo-500 mb-1">3. Organiser Finalization</div>
                  After the check-in window closes, the organiser locks the active participant roster to freeze panel allocations and evaluation matrices.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MEMBER REPLACEMENT MODAL */}
      {replacingReg && replacingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden animate-scale-in"
            style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
          >
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-display" style={{ color: 'var(--text-primary)' }}>
                    Substitute Team Member
                  </h3>
                  <p className="text-xs text-slate-400">
                    Team: {replacingReg.teamName || replacingReg.studentName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setReplacingReg(null); setReplacingMember(null); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleExecuteReplacement} className="p-6 space-y-4 text-xs">
              {/* Original Member Info */}
              <div className="p-3.5 rounded-xl border bg-rose-500/5 border-rose-500/20 text-xs">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Member Being Replaced</span>
                <div className="font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{replacingMember.name}</div>
                <div className="text-slate-400 text-[11px]">{replacingMember.rollNumber} • {replacingMember.email}</div>
              </div>

              {replaceError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{replaceError}</span>
                </div>
              )}

              {replaceSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{replaceSuccess}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      New Member Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRoll}
                      onChange={(e) => setNewRoll(e.target.value)}
                      placeholder="e.g. 21CS088"
                      className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Institutional Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="priya.s@college.edu"
                      className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98000 11223"
                      className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Department
                    </label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border text-xs focus:outline-none"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    >
                      <option value="Computer Science & Engineering">CSE</option>
                      <option value="Artificial Intelligence & DS">AI & DS</option>
                      <option value="Information Technology">IT</option>
                      <option value="Electronics & Comm Engg">ECE</option>
                      <option value="Mechanical Engineering">Mech</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Year
                    </label>
                    <select
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border text-xs focus:outline-none"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    >
                      <option value="1st Year (Freshman)">1st Year</option>
                      <option value="2nd Year (Sophomore)">2nd Year</option>
                      <option value="3rd Year (Junior)">3rd Year</option>
                      <option value="4th Year (Senior)">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Section
                    </label>
                    <input
                      type="text"
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                      placeholder="Sec-A"
                      className="w-full px-2 py-2 rounded-xl border text-xs focus:outline-none"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Official Reason for Member Replacement *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={replaceReason}
                    onChange={(e) => setReplaceReason(e.target.value)}
                    placeholder="e.g. Medical emergency / fever on morning check-in approved by dept coordinator."
                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--border-default)' }}>
                <button
                  type="button"
                  onClick={() => { setReplacingReg(null); setReplacingMember(null); }}
                  className="px-4 py-2 rounded-xl border font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                  style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surface-raised)' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Member Replacement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
