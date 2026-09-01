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
  IdCard,
  Lock,
  KeyRound,
  Edit2,
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
    updateVolunteerAssignments,
  } = useApp();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'INCOMPLETE_TEAMS' | 'ROUNDS' | 'SCHEDULE'>('ATTENDANCE');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'INCOMPLETE' | 'REPLACED'>('ALL');
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});

  // Editing state: controls whether a row is in edit mode
  const [editingTeamIds, setEditingTeamIds] = useState<Record<string, boolean>>({});
  const [editingMemberIds, setEditingMemberIds] = useState<Record<string, boolean>>({});

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

  // Quick Action Feedback Notice
  const [actionNotice, setActionNotice] = useState<{ id: string; text: string; type: 'success' | 'warn' } | null>(null);

  // Self-Authorize with Volunteer ID
  const [authIdInput, setAuthIdInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const eventRegs = activeEvent ? registrations.filter((r) => r.eventId === activeEvent.id) : [];

  // Volunteer's private ID
  const myVolunteerId = currentUser?.volunteerId || (currentUser?.email === 'volunteer@college.edu' ? 'VOL-7821' : 'VOL-9142');

  // Check if current volunteer is officially assigned to this event
  const myAssignment = activeEvent?.volunteerAssignments?.find(
    (va) =>
      va.volunteerId?.toUpperCase() === myVolunteerId.toUpperCase() ||
      va.volunteerEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
      va.volunteerName?.toLowerCase() === currentUser?.name?.toLowerCase() ||
      va.volunteerId === currentUser?.id
  );

  const isAuthorized = Boolean(myAssignment);

  // Stats calculation
  const totalCount = eventRegs.length;
  const presentCount = eventRegs.filter((r) => r.attendance?.attended).length;
  const absentCount = eventRegs.filter((r) => !r.attendance?.attended).length;
  const replacedCount = eventRegs.reduce((acc, r) => acc + (r.replacementHistory?.length || 0), 0);
  const incompleteTeams = eventRegs.filter((r) => r.teamEligibility === 'INCOMPLETE_TEAM');
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const toggleExpand = (regId: string) => {
    setExpandedTeams((prev) => ({ ...prev, [regId]: !prev[regId] }));
  };

  const handleMarkStatus = (regId: string, status: AttendanceStatus, memberId?: string, memberName?: string) => {
    markParticipantAttendance(regId, status, memberId);

    // Automatically close edit mode after marking
    if (memberId) {
      setEditingMemberIds((prev) => ({ ...prev, [memberId]: false }));
    } else {
      setEditingTeamIds((prev) => ({ ...prev, [regId]: false }));
    }

    if (status === 'PRESENT') {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }

    setActionNotice({
      id: regId,
      text: `${memberName ? `${memberName} marked` : 'Team marked'} ${status === 'PRESENT' ? 'Present ✓' : 'Absent ✕'}`,
      type: status === 'PRESENT' ? 'success' : 'warn',
    });

    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleSelfAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authIdInput.trim() || !activeEvent) return;

    const code = authIdInput.trim().toUpperCase();
    if (code === myVolunteerId.toUpperCase() || code.startsWith('VOL-')) {
      const newAss: any = {
        id: `va_${Date.now()}`,
        volunteerId: code,
        volunteerName: currentUser?.name || 'Volunteer Coordinator',
        volunteerEmail: currentUser?.email || 'volunteer@college.edu',
        role: 'Attendance & QR Verification',
        location: 'Main Foyer Check-in Station',
        assignedLocation: 'Main Foyer Check-in Station',
        timeSlot: `${activeEvent.startTime} - ${activeEvent.endTime}`,
        status: 'CHECKED_IN',
        notes: `Authorized via Private Volunteer ID ${code}`,
      };

      const updated = [newAss, ...(activeEvent.volunteerAssignments || [])];
      updateVolunteerAssignments(activeEvent.id, updated);
      setAuthIdInput('');
      setAuthError(null);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    } else {
      setAuthError('Invalid Volunteer ID format. Must begin with VOL- (e.g. VOL-7821).');
    }
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
      if (replacingMember) {
        setEditingMemberIds((prev) => ({ ...prev, [replacingMember.id]: false }));
      }
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

    if (statusFilter === 'PRESENT') return r.attendance?.attended;
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
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider" style={{ backgroundColor: 'var(--role-volunteer-bg)', color: 'var(--role-volunteer-color)', border: `1px solid ${isDark ? 'rgba(5,150,105,0.3)' : 'rgba(5,150,105,0.2)'}` }}>
                  Volunteer Operations Desk
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{currentUser?.name}</span>

                {/* Private Volunteer ID Badge */}
                <span className="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/30 flex items-center gap-1">
                  <IdCard className="w-3.5 h-3.5" /> Private ID: {myVolunteerId}
                </span>

                {isAuthorized ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Assigned & Authorized
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Unassigned for this Event
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {activeEvent?.title || 'Event Attendance Hub'}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--role-volunteer-color)' }}>
                  <MapPin className="w-3.5 h-3.5" /> Station: {myAssignment?.assignedLocation || 'Entrance Check-in Desk'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-500" /> Slot: {myAssignment?.timeSlot || '08:30 AM - 01:00 PM'}
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Active Present: {presentCount} / {totalCount} ({attendanceRate}%)
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
              type="button"
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
              type="button"
              onClick={() => { setActiveTab('INCOMPLETE_TEAMS'); setStatusFilter('INCOMPLETE'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'INCOMPLETE_TEAMS'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'hover:bg-slate-500/10'
              }`}
              style={{ color: activeTab === 'INCOMPLETE_TEAMS' ? '#ffffff' : 'var(--text-secondary)' }}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Incomplete Squads ({incompleteTeams.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ROUNDS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ROUNDS'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'hover:bg-slate-500/10'
              }`}
              style={{ color: activeTab === 'ROUNDS' ? '#ffffff' : 'var(--text-secondary)' }}
            >
              <Activity className="w-4 h-4" />
              <span>Round Stage Evaluation</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SCHEDULE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SCHEDULE'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'hover:bg-slate-500/10'
              }`}
              style={{ color: activeTab === 'SCHEDULE' ? '#ffffff' : 'var(--text-secondary)' }}
            >
              <Calendar className="w-4 h-4" />
              <span>Timeline & Assignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* Access Verification Alert if not assigned */}
        {!isAuthorized && (
          <div className="p-5 rounded-3xl border bg-amber-500/10 border-amber-500/30 text-xs space-y-3">
            <div className="flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-600">
                  Volunteer Assignment Authorization Notice
                </h4>
                <p className="text-slate-400 mt-0.5 leading-relaxed">
                  Your Private Volunteer ID (<strong>{myVolunteerId}</strong>) has not been assigned to <strong>{activeEvent.title}</strong> yet. The event organiser can assign you from the Volunteer Management panel, or you can self-authorize below.
                </p>
              </div>
            </div>

            <form onSubmit={handleSelfAuthorize} className="flex flex-col sm:flex-row items-stretch gap-2 max-w-md">
              <input
                type="text"
                value={authIdInput}
                onChange={(e) => setAuthIdInput(e.target.value)}
                placeholder="Enter Private Volunteer ID (e.g. VOL-7821)..."
                className="flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none font-mono"
                style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Authorize Check-In Desk
              </button>
            </form>

            {authError && <p className="text-rose-500 font-semibold">{authError}</p>}
          </div>
        )}

        {/* Real-time KPI Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl border transition-all" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>Total Enrolled</div>
            <div className="text-2xl font-bold font-display mt-0.5" style={{ color: 'var(--text-primary)' }}>{totalCount}</div>
            <div className="text-[10px] text-slate-400">All registered squads</div>
          </div>

          <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="text-[11px] font-semibold text-emerald-500">Present (Checked In)</div>
            <div className="text-2xl font-bold font-display text-emerald-500 mt-0.5">{presentCount}</div>
            <div className="text-[10px] text-slate-400">Verified on active roster</div>
          </div>

          <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="text-[11px] font-semibold text-rose-500">Absent / No-Show</div>
            <div className="text-2xl font-bold font-display text-rose-500 mt-0.5">{absentCount}</div>
            <div className="text-[10px] text-slate-400">Unreported attendees</div>
          </div>

          <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="text-[11px] font-semibold text-indigo-500">Replaced Members</div>
            <div className="text-2xl font-bold font-display text-indigo-500 mt-0.5">{replacedCount}</div>
            <div className="text-[10px] text-slate-400">Official substitutions</div>
          </div>

          <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="text-[11px] font-semibold text-sky-500">Attendance Rate</div>
            <div className="text-2xl font-bold font-display text-sky-500 mt-0.5">{attendanceRate}%</div>
            <div className="text-[10px] text-slate-400">Eligible participant ratio</div>
          </div>
        </div>

        {/* Global Action Feedback Notice */}
        {actionNotice && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border animate-fade-in ${
            actionNotice.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionNotice.text}</span>
            </div>
            <span className="text-[10px] opacity-70">Audit synchronized</span>
          </div>
        )}

        {/* TAB 1: PARTICIPANT ATTENDANCE ROSTER */}
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
                  { key: 'ABSENT', label: `Absent (${absentCount})` },
                  { key: 'INCOMPLETE', label: `Incomplete Squads (${incompleteTeams.length})` },
                  { key: 'REPLACED', label: `Replaced (${replacedCount})` },
                ].map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
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
                  const isTeamEditing = Boolean(editingTeamIds[reg.id]);
                  const isAttended = Boolean(reg.attendance?.attended);

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
                      attendanceStatus: isAttended ? 'PRESENT' : 'ABSENT',
                      isActive: true,
                      isLead: true,
                    },
                  ];

                  const isTeam = Boolean(reg.teamName && members.length > 1);
                  const activeMembers = members.filter((m) => m.attendanceStatus !== 'REPLACED' && m.attendanceStatus !== 'WITHDRAWN');
                  const presentMemberCount = activeMembers.filter((m) => m.attendanceStatus === 'PRESENT').length;
                  const totalMemberCount = activeMembers.length;

                  return (
                    <div
                      key={reg.id}
                      className="rounded-2xl border transition-all duration-200 overflow-hidden"
                      style={{
                        backgroundColor: 'var(--surface-base)',
                        borderColor: reg.teamEligibility === 'INCOMPLETE_TEAM'
                          ? 'rgba(217,119,6,0.35)'
                          : isAttended
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
                              backgroundColor: isAttended ? 'rgba(5,150,105,0.12)' : 'rgba(239,68,68,0.12)',
                              color: isAttended ? '#059669' : '#ef4444',
                              border: `1px solid ${isAttended ? 'rgba(5,150,105,0.25)' : 'rgba(239,68,68,0.25)'}`,
                            }}
                          >
                            {isTeam ? <Users className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                                {reg.teamName || reg.studentName}
                              </span>

                              {/* 3/4 Present Indication Badge */}
                              <span
                                className="px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 border shadow-xs"
                                style={{
                                  backgroundColor:
                                    presentMemberCount === totalMemberCount && totalMemberCount > 0
                                      ? 'rgba(5,150,105,0.15)'
                                      : presentMemberCount > 0
                                      ? 'rgba(217,119,6,0.15)'
                                      : 'rgba(239,68,68,0.15)',
                                  color:
                                    presentMemberCount === totalMemberCount && totalMemberCount > 0
                                      ? '#059669'
                                      : presentMemberCount > 0
                                      ? '#d97706'
                                      : '#ef4444',
                                  borderColor:
                                    presentMemberCount === totalMemberCount && totalMemberCount > 0
                                      ? 'rgba(5,150,105,0.3)'
                                      : presentMemberCount > 0
                                      ? 'rgba(217,119,6,0.3)'
                                      : 'rgba(239,68,68,0.3)',
                                }}
                              >
                                {presentMemberCount === totalMemberCount && totalMemberCount > 0 ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <Users className="w-3.5 h-3.5" />
                                )}
                                <span>{presentMemberCount}/{totalMemberCount} Present</span>
                              </span>

                              {/* Squad Eligibility Badge */}
                              {reg.teamEligibility === 'INCOMPLETE_TEAM' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Incomplete (Min {activeEvent.teamSizeMin || 2} Req)
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
                              {reg.attendance?.timestamp && isAttended && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-500 font-medium">Checked in at {new Date(reg.attendance.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Attendance Action Controls */}
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {isTeamEditing ? (
                            /* EDIT MODE: Show Action buttons to mark Present / Absent / Members / Cancel */
                            <div className="flex items-center gap-2 flex-wrap p-1.5 rounded-2xl border bg-slate-500/5 animate-fade-in" style={{ borderColor: 'var(--border-default)' }}>
                              <button
                                type="button"
                                onClick={() => handleMarkStatus(reg.id, 'PRESENT', undefined, reg.studentName)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                              >
                                <Check className="w-4 h-4" />
                                <span>Present</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMarkStatus(reg.id, 'ABSENT', undefined, reg.studentName)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/20"
                              >
                                <X className="w-4 h-4" />
                                <span>Absent</span>
                              </button>

                              {isTeam && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(reg.id)}
                                  className="px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold hover:bg-slate-500/10 cursor-pointer"
                                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                                >
                                  <span>{isExpanded ? 'Hide Members' : `Members (${presentMemberCount}/${totalMemberCount})`}</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setEditingTeamIds((prev) => ({ ...prev, [reg.id]: false }))}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            /* CLEAN MARKED MODE: Only show the marked status block + Edit button */
                            <div className="flex items-center gap-2">
                              {isAttended ? (
                                <div className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/25 flex items-center gap-1.5">
                                  <Check className="w-4 h-4" />
                                  <span>Present</span>
                                </div>
                              ) : (
                                <div className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md shadow-rose-600/25 flex items-center gap-1.5">
                                  <X className="w-4 h-4" />
                                  <span>Absent</span>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => setEditingTeamIds((prev) => ({ ...prev, [reg.id]: true }))}
                                className="px-3 py-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold hover:bg-slate-500/10 cursor-pointer transition-all"
                                style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                                title="Click to edit attendance"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Edit</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded Team Members List & Replacement Actions */}
                      {isTeam && isExpanded && (
                        <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surface-raised)' }}>
                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                            <span>Squad Members Individual Attendance ({presentMemberCount}/{totalMemberCount} Present)</span>
                            <span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>
                              Minimum {activeEvent.teamSizeMin || 2} Present required for judging eligibility
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {members.map((member) => {
                              const isReplaced = member.attendanceStatus === 'REPLACED';
                              const isMemberPresent = member.attendanceStatus === 'PRESENT';
                              const isMemberEditing = Boolean(editingMemberIds[member.id]);

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
                                      : 'rgba(239,68,68,0.25)',
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
                                              Lead
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
                                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                        style={{
                                          backgroundColor: isMemberPresent ? '#059669' : isReplaced ? '#64748b' : '#ef4444',
                                          color: '#ffffff',
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

                                  {/* Member Level Interactive Controls */}
                                  {!isReplaced && (
                                    <div className="pt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
                                      {isMemberEditing ? (
                                        /* Member Edit Mode */
                                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                          <div className="flex items-center gap-1.5 flex-1">
                                            <button
                                              type="button"
                                              onClick={() => handleMarkStatus(reg.id, 'PRESENT', member.id, member.name)}
                                              className="py-1 px-2.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 cursor-pointer shadow-sm"
                                            >
                                              <Check className="w-3.5 h-3.5" />
                                              <span>Present</span>
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() => handleMarkStatus(reg.id, 'ABSENT', member.id, member.name)}
                                              className="py-1 px-2.5 rounded-lg text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 cursor-pointer shadow-sm"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                              <span>Absent</span>
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() => openReplaceModal(reg, member)}
                                              className="py-1 px-2.5 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 cursor-pointer shadow-sm"
                                            >
                                              <UserPlus className="w-3.5 h-3.5" />
                                              <span>Replace</span>
                                            </button>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => setEditingMemberIds((prev) => ({ ...prev, [member.id]: false }))}
                                            className="py-1 px-2 text-[10px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        /* Member Clean Marked Mode */
                                        <div className="flex items-center justify-between">
                                          {isMemberPresent ? (
                                            <div className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm shadow-emerald-600/20">
                                              <Check className="w-3.5 h-3.5" />
                                              <span>Present</span>
                                            </div>
                                          ) : (
                                            <div className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-600 text-white flex items-center gap-1 shadow-sm shadow-rose-600/20">
                                              <X className="w-3.5 h-3.5" />
                                              <span>Absent</span>
                                            </div>
                                          )}

                                          <button
                                            type="button"
                                            onClick={() => setEditingMemberIds((prev) => ({ ...prev, [member.id]: true }))}
                                            className="px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold text-slate-300 hover:bg-slate-500/10 cursor-pointer flex items-center gap-1 transition-all"
                                            style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surface-raised)' }}
                                            title="Edit member attendance or replace"
                                          >
                                            <Edit2 className="w-3 h-3 text-indigo-500" />
                                            <span>Edit</span>
                                          </button>
                                        </div>
                                      )}
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
                Track round completion for attending teams. Only active present participants from the roster are eligible for scoring.
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
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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

        {/* TAB 4: EVENT TIMELINE & ASSIGNMENT */}
        {activeTab === 'SCHEDULE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Event Agenda & Operations Schedule</h3>
              </div>

              <div className="space-y-3">
                {activeEvent?.agenda?.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border flex items-start justify-between gap-3" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                    <div>
                      <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{item.activity}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.time} • {item.venue}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Responsible: {item.responsiblePerson}</div>
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
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>My Volunteer Duty Assignment</h3>
              </div>

              <div className="p-4 rounded-xl border space-y-2 text-xs" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Private Volunteer ID:</span>
                  <span className="font-mono font-bold text-indigo-500">{myVolunteerId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Assigned Duty Role:</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{myAssignment?.role || 'Attendance & QR Verification'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Check-in Location:</span>
                  <span className="text-amber-500 font-bold">{myAssignment?.assignedLocation || 'Main Foyer Entrance Desk'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Time Slot:</span>
                  <span className="text-sky-500 font-mono">{myAssignment?.timeSlot || '08:30 AM - 01:00 PM'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
                  <span className="text-slate-400 font-semibold">Duty Status:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                    {myAssignment?.status || 'CHECKED_IN'}
                  </span>
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
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{replaceError}</span>
                </div>
              )}

              {replaceSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-2">
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
