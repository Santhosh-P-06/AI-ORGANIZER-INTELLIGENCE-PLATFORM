'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useTheme } from '../../../context/ThemeContext';
import { Registration, EventItem, AttendanceStatus, TeamMember, MemberReplacementRecord } from '../../../types';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  FileJson,
  X,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserPlus,
  AlertTriangle,
  History,
  Lock,
  Unlock,
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationManagerProps {
  event: EventItem;
}

export const RegistrationManager: React.FC<RegistrationManagerProps> = ({ event }) => {
  const {
    registrations,
    updateRegistrationStatus,
    markParticipantAttendance,
    replaceTeamMember,
    finalizeActiveRoster,
    unfinalizeActiveRoster,
    sendAbsenceAlerts,
  } = useApp();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Member Replacement Modal State
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

  // History Drawer State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryReg, setSelectedHistoryReg] = useState<Registration | null>(null);

  // Status Action Feedback
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const eventRegs = registrations.filter((r) => r.eventId === event.id);

  // Filters
  const filteredRegs = eventRegs.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.teamName && r.teamName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.membersList && r.membersList.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesDept = deptFilter === 'ALL' || r.department.toLowerCase().includes(deptFilter.toLowerCase());

    let matchesAttendance = true;
    if (attendanceFilter === 'PRESENT') matchesAttendance = Boolean(r.attendance?.attended && r.attendance?.status !== 'LATE');
    else if (attendanceFilter === 'LATE') matchesAttendance = r.attendance?.status === 'LATE';
    else if (attendanceFilter === 'ABSENT') matchesAttendance = !r.attendance?.attended;
    else if (attendanceFilter === 'INCOMPLETE') matchesAttendance = r.teamEligibility === 'INCOMPLETE_TEAM';
    else if (attendanceFilter === 'REPLACED') matchesAttendance = (r.replacementHistory?.length || 0) > 0;

    return matchesSearch && matchesStatus && matchesDept && matchesAttendance;
  });

  const confirmedCount = eventRegs.filter((r) => r.status === 'CONFIRMED').length;
  const presentCount = eventRegs.filter((r) => r.attendance?.attended && r.attendance?.status !== 'LATE').length;
  const lateCount = eventRegs.filter((r) => r.attendance?.status === 'LATE').length;
  const absentCount = eventRegs.filter((r) => !r.attendance?.attended).length;
  const replacedCount = eventRegs.reduce((acc, r) => acc + (r.replacementHistory?.length || 0), 0);
  const incompleteTeams = eventRegs.filter((r) => r.teamEligibility === 'INCOMPLETE_TEAM');
  const capacityPercent = Math.min(100, Math.round((eventRegs.length / event.maxStudents) * 100));

  const departments = Array.from(new Set(eventRegs.map((r) => r.department)));

  const toggleExpandRow = (regId: string) => {
    setExpandedRows((prev) => ({ ...prev, [regId]: !prev[regId] }));
  };

  const handleMarkStatus = (regId: string, status: AttendanceStatus, memberId?: string, memberName?: string) => {
    markParticipantAttendance(regId, status, memberId);
    setActionNotice(`${memberName ? `${memberName} marked` : 'Registration marked'} ${status}`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleFinalizeRoster = () => {
    const result = finalizeActiveRoster(event.id);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setActionNotice(result.message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleUnfinalizeRoster = () => {
    unfinalizeActiveRoster(event.id);
    setActionNotice('Active roster reopened for attendance & substitution edits.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSendAbsenceAlerts = () => {
    const result = sendAbsenceAlerts(event.id);
    setActionNotice(result.message);
    setTimeout(() => setActionNotice(null), 4000);
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
      setReplaceError('Please complete all required fields and reason.');
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
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => {
        setReplacingReg(null);
        setReplacingMember(null);
      }, 1500);
    } else {
      setReplaceError(result.message);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Reg ID', 'Student / Lead Name', 'Roll No', 'Email', 'Phone', 'Department', 'Year', 'Team Name', 'Attendance Status', 'Attendance %', 'Team Eligibility', 'Registered At'];
    const rows = filteredRegs.map((r) => [
      r.id,
      `"${r.studentName}"`,
      r.rollNumber,
      r.email,
      r.phone,
      `"${r.department}"`,
      r.year,
      `"${r.teamName || 'Individual'}"`,
      r.attendance?.status || (r.attendance?.attended ? 'PRESENT' : 'ABSENT'),
      `${r.overallAttendancePercentage ?? (r.attendance?.attended ? 100 : 0)}%`,
      r.teamEligibility || 'ELIGIBLE',
      r.registeredAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Active_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredRegs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Active_Roster.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Finalize Roster Controls & Summary */}
      <div className="p-6 rounded-3xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider bg-indigo-500/15 text-indigo-600 border border-indigo-500/30">
              Active Roster Intelligence Control
            </span>
            {event.isRosterFinalized ? (
              <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked & Finalized
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Live Check-in / Draft Roster
              </span>
            )}
          </div>
          <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            Participant Attendance & Active Team Roster
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mark individual member attendance, substitute absent participants, and finalize the official roster used for jury panel evaluation and certificate generation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {absentCount > 0 && (
            <button
              type="button"
              onClick={handleSendAbsenceAlerts}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer hover:bg-slate-500/10"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              title="Broadcast urgent alerts to absent registered students"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>Send Absence Alerts ({absentCount})</span>
            </button>
          )}

          {!event.isRosterFinalized ? (
            <button
              type="button"
              onClick={handleFinalizeRoster}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Finalize Active Roster</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUnfinalizeRoster}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Reopen Roster</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
          <span className="text-[10px] opacity-70">Audit synchronized</span>
        </div>
      )}

      {/* Real-time KPI Stats Grid (Clickable Filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          type="button"
          onClick={() => setAttendanceFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            attendanceFilter === 'ALL' ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:border-slate-600'
          }`}
          style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
        >
          <div className="text-xs text-slate-400 font-medium">Total Registered</div>
          <div className="text-xl font-bold font-display mt-1" style={{ color: 'var(--text-primary)' }}>{eventRegs.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Cap: {event.maxStudents}</div>
        </button>

        <button
          type="button"
          onClick={() => setAttendanceFilter('PRESENT')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            attendanceFilter === 'PRESENT' ? 'ring-2 ring-emerald-500 shadow-md' : 'hover:border-slate-600'
          }`}
          style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
        >
          <div className="text-xs font-medium text-emerald-500">Present (On-Time)</div>
          <div className="text-xl font-bold font-display text-emerald-500 mt-1">{presentCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Confirmed attendance</div>
        </button>

        <button
          type="button"
          onClick={() => setAttendanceFilter('LATE')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            attendanceFilter === 'LATE' ? 'ring-2 ring-amber-500 shadow-md' : 'hover:border-slate-600'
          }`}
          style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
        >
          <div className="text-xs font-medium text-amber-500">Late Arrivals</div>
          <div className="text-xl font-bold font-display text-amber-500 mt-1">{lateCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Logged with notes</div>
        </button>

        <button
          type="button"
          onClick={() => setAttendanceFilter('ABSENT')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            attendanceFilter === 'ABSENT' ? 'ring-2 ring-rose-500 shadow-md' : 'hover:border-slate-600'
          }`}
          style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
        >
          <div className="text-xs font-medium text-rose-500">Absent / No-Show</div>
          <div className="text-xl font-bold font-display text-rose-500 mt-1">{absentCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Pending check-in</div>
        </button>

        <button
          type="button"
          onClick={() => setAttendanceFilter('REPLACED')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            attendanceFilter === 'REPLACED' ? 'ring-2 ring-purple-500 shadow-md' : 'hover:border-slate-600'
          }`}
          style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
        >
          <div className="text-xs font-medium text-purple-500">Substitutions</div>
          <div className="text-xl font-bold font-display text-purple-500 mt-1">{replacedCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Member replacements</div>
        </button>

        <button
          type="button"
          onClick={() => setAttendanceFilter('INCOMPLETE')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            attendanceFilter === 'INCOMPLETE' ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:border-slate-600'
          }`}
          style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
        >
          <div className="text-xs font-medium text-indigo-500">Incomplete Squads</div>
          <div className="text-xl font-bold font-display text-indigo-500 mt-1">{incompleteTeams.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Below min team size</div>
        </button>
      </div>

      {/* Controls Bar: Search, Filters, Export */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, roll no, team..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none border transition-all"
              style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Attendance Filter */}
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border text-xs focus:outline-none font-semibold"
            style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Attendance ({eventRegs.length})</option>
            <option value="PRESENT">Present Only ({presentCount})</option>
            <option value="LATE">Late Only ({lateCount})</option>
            <option value="ABSENT">Absent / No-Show ({absentCount})</option>
            <option value="INCOMPLETE">Incomplete Squads ({incompleteTeams.length})</option>
            <option value="REPLACED">Substituted Members ({replacedCount})</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border text-xs focus:outline-none max-w-[150px] truncate font-semibold"
            style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Export Actions */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors hover:bg-slate-500/10 cursor-pointer"
            style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors hover:bg-slate-500/10 cursor-pointer"
            style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            title="Export JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-sky-500" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Registrations Data Table */}
      <div className="overflow-x-auto rounded-3xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
        <table className="w-full text-left text-xs">
          <thead className="border-b uppercase text-[10px] tracking-wider" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
            <tr>
              <th className="p-4">Student / Squad (Click to View)</th>
              <th className="p-4">Department & Year</th>
              <th className="p-4">Team Status & Roster</th>
              <th className="p-4">Attendance</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
            {filteredRegs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-xs text-slate-400">
                  No participants matching your filters.
                </td>
              </tr>
            ) : (
              filteredRegs.map((reg) => {
                const members = reg.membersList || [];
                const isTeam = Boolean(reg.teamName && members.length > 1);
                const isExpanded = Boolean(expandedRows[reg.id]);
                const isAttended = reg.attendance?.attended;

                return (
                  <React.Fragment key={reg.id}>
                    <tr className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-4 cursor-pointer group" onClick={() => setSelectedReg(reg)}>
                        <div className="font-bold text-sm group-hover:text-sky-500 transition-colors flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                          <span>{reg.studentName}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-sky-500" />
                        </div>
                        <div className="text-[11px] font-mono text-sky-500 font-semibold mt-0.5">
                          {reg.rollNumber}
                        </div>
                        <div className="text-[10px] text-slate-400">{reg.email}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{reg.department}</div>
                        <div className="text-[11px] text-slate-400">{reg.year} • {reg.section}</div>
                      </td>

                      <td className="p-4">
                        {reg.teamName ? (
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-indigo-500/10 text-indigo-600 border border-indigo-500/30">
                              {reg.teamName}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {members.filter(m => m.isActive).length} active members
                            </div>
                            {reg.teamEligibility === 'INCOMPLETE_TEAM' && (
                              <span className="text-[10px] text-amber-500 font-bold block flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Incomplete Squad
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Solo Participant</span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              reg.attendance?.status === 'LATE'
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                                : isAttended
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                            }`}
                          >
                            {isAttended ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{reg.attendance?.status || (isAttended ? 'PRESENT' : 'ABSENT')}</span>
                          </span>

                          <div className="text-[10px] text-slate-400">
                            Score: <strong className="text-emerald-500">{reg.overallAttendancePercentage ?? (isAttended ? 100 : 0)}%</strong>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Quick Attendance Toggle Buttons */}
                          <button
                            type="button"
                            onClick={() => handleMarkStatus(reg.id, 'PRESENT', undefined, reg.studentName)}
                            className="p-1.5 rounded-lg border text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                            style={{ borderColor: 'var(--border-default)' }}
                            title="Mark Present"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMarkStatus(reg.id, 'LATE', undefined, reg.studentName)}
                            className="p-1.5 rounded-lg border text-amber-600 hover:bg-amber-500/10 cursor-pointer"
                            style={{ borderColor: 'var(--border-default)' }}
                            title="Mark Late"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMarkStatus(reg.id, 'ABSENT', undefined, reg.studentName)}
                            className="p-1.5 rounded-lg border text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                            style={{ borderColor: 'var(--border-default)' }}
                            title="Mark Absent"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          {/* Replacement History */}
                          {reg.replacementHistory && reg.replacementHistory.length > 0 && (
                            <button
                              type="button"
                              onClick={() => { setSelectedHistoryReg(reg); setShowHistoryModal(true); }}
                              className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-600 hover:bg-purple-500/20 cursor-pointer"
                              title="View Substitution Timeline"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Expand Members */}
                          {isTeam && (
                            <button
                              type="button"
                              onClick={() => toggleExpandRow(reg.id)}
                              className="p-1.5 rounded-lg border text-slate-400 hover:text-slate-200 cursor-pointer"
                              style={{ borderColor: 'var(--border-default)' }}
                              title="Toggle Squad Member Details"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* View Custom Responses */}
                          <button
                            type="button"
                            onClick={() => setSelectedReg(reg)}
                            className="p-1.5 rounded-lg border text-slate-400 hover:text-slate-200 cursor-pointer"
                            style={{ borderColor: 'var(--border-default)' }}
                            title="View Form Data"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Team Members Sub-Roster Row */}
                    {isTeam && isExpanded && (
                      <tr style={{ backgroundColor: 'var(--surface-raised)' }}>
                        <td colSpan={5} className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                              <span>Squad Members Roster & Individual Attendance</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                Team Lead: {reg.studentName} ({reg.rollNumber})
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {members.map((member) => {
                                const isReplaced = member.attendanceStatus === 'REPLACED';
                                const isMemberPresent = member.attendanceStatus === 'PRESENT' || member.attendanceStatus === 'LATE';

                                return (
                                  <div
                                    key={member.id}
                                    className="p-3 rounded-2xl border flex flex-col justify-between gap-2"
                                    style={{
                                      backgroundColor: isReplaced ? 'rgba(100,116,139,0.06)' : 'var(--surface-base)',
                                      borderColor: 'var(--border-default)',
                                      opacity: isReplaced ? 0.6 : 1,
                                    }}
                                  >
                                    <div>
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                                            {member.name}
                                          </div>
                                          <div className="font-mono text-[10px] text-sky-500">{member.rollNumber}</div>
                                          <div className="text-[10px] text-slate-400">{member.email}</div>
                                        </div>

                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                          isMemberPresent ? 'bg-emerald-500/10 text-emerald-600' : isReplaced ? 'bg-slate-500/10 text-slate-500' : 'bg-rose-500/10 text-rose-600'
                                        }`}>
                                          {member.attendanceStatus}
                                        </span>
                                      </div>

                                      {member.replacementInfo && (
                                        <div className="mt-1.5 p-1.5 rounded-lg bg-purple-500/10 text-[9px] text-purple-600">
                                          Substituted: {member.replacementInfo.reason}
                                        </div>
                                      )}
                                    </div>

                                    {!isReplaced && (
                                      <div className="flex items-center gap-1 pt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
                                        <button
                                          type="button"
                                          onClick={() => handleMarkStatus(reg.id, 'PRESENT', member.id, member.name)}
                                          className="flex-1 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 cursor-pointer"
                                        >
                                          Present
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleMarkStatus(reg.id, 'LATE', member.id, member.name)}
                                          className="flex-1 py-1 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 cursor-pointer"
                                        >
                                          Late
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleMarkStatus(reg.id, 'ABSENT', member.id, member.name)}
                                          className="flex-1 py-1 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 cursor-pointer"
                                        >
                                          Absent
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => openReplaceModal(reg, member)}
                                          className="py-1 px-2 rounded text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                                          title="Replace Member"
                                        >
                                          <UserPlus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MEMBER REPLACEMENT MODAL */}
      {replacingReg && replacingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden animate-scale-in" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-display" style={{ color: 'var(--text-primary)' }}>
                    Substitute Team Participant
                  </h3>
                  <p className="text-xs text-slate-400">Team: {replacingReg.teamName || replacingReg.studentName}</p>
                </div>
              </div>
              <button onClick={() => { setReplacingReg(null); setReplacingMember(null); }} className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteReplacement} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl border bg-rose-500/5 border-rose-500/20 text-xs">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Member Being Substituted</span>
                <div className="font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{replacingMember.name}</div>
                <div className="text-slate-400 text-[11px]">{replacingMember.rollNumber} • {replacingMember.email}</div>
              </div>

              {replaceError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{replaceError}</span>
                </div>
              )}

              {replaceSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-semibold flex items-center gap-2">
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
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98000 11223"
                      className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Official Reason for Substitution *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={replaceReason}
                    onChange={(e) => setReplaceReason(e.target.value)}
                    placeholder="e.g. Approved medical leave / emergency replacement"
                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2" style={{ borderColor: 'var(--border-default)' }}>
                <button
                  type="button"
                  onClick={() => { setReplacingReg(null); setReplacingMember(null); }}
                  className="px-4 py-2 rounded-xl border font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Confirm Substitution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER REPLACEMENT TIMELINE MODAL */}
      {showHistoryModal && selectedHistoryReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden animate-scale-in" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                  Substitution Audit Trail: {selectedHistoryReg.teamName || selectedHistoryReg.studentName}
                </h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {selectedHistoryReg.replacementHistory?.map((hist) => (
                <div key={hist.id} className="p-4 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Replaced by <strong>{hist.replacedByActorName}</strong> ({hist.replacedByActorRole})</span>
                    <span>{new Date(hist.replacedAt).toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl border bg-rose-500/5 border-rose-500/20">
                      <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block">Original (Replaced)</span>
                      <div className="font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{hist.originalMember.name}</div>
                      <div className="text-[10px] text-slate-400">{hist.originalMember.rollNumber}</div>
                    </div>

                    <div className="p-2.5 rounded-xl border bg-emerald-500/5 border-emerald-500/20">
                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider block">New Active Member</span>
                      <div className="font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{hist.newMember.name}</div>
                      <div className="text-[10px] text-slate-400">{hist.newMember.rollNumber}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reason</span>
                    <p className="mt-0.5 italic text-slate-300">{hist.reason}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t flex justify-end" style={{ borderColor: 'var(--border-default)' }}>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl border font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED RESPONSE MODAL */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="p-5 border-b flex items-start justify-between gap-4 sticky top-0 z-10" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">
                    {selectedReg.teamName ? `Squad: ${selectedReg.teamName}` : 'Individual Participant'}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    selectedReg.attendance?.status === 'PRESENT' || selectedReg.attendance?.attended
                      ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                      : selectedReg.attendance?.status === 'LATE'
                      ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                  }`}>
                    {selectedReg.attendance?.status || (selectedReg.attendance?.attended ? 'PRESENT' : 'ABSENT')}
                  </span>
                  {selectedReg.teamEligibility === 'INCOMPLETE_TEAM' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30">
                      Incomplete Squad
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-display font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  {selectedReg.studentName} ({selectedReg.rollNumber})
                </h3>
              </div>
              <button onClick={() => setSelectedReg(null)} className="p-1.5 text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Quick Attendance Action Controls */}
              <div className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance & Check-in Control</span>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    Current Status: <strong className={selectedReg.attendance?.attended ? 'text-emerald-500' : 'text-rose-500'}>
                      {selectedReg.attendance?.status || (selectedReg.attendance?.attended ? 'Verified Present' : 'Absent / Not Checked In')}
                    </strong>
                    {selectedReg.attendance?.timestamp && (
                      <span className="text-[11px] text-slate-400 ml-2 font-normal">
                        ({new Date(selectedReg.attendance.timestamp).toLocaleTimeString()})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkStatus(selectedReg.id, 'PRESENT', undefined, selectedReg.studentName);
                      setSelectedReg({ ...selectedReg, attendance: { ...selectedReg.attendance, attended: true, status: 'PRESENT' } });
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border border-emerald-500/30 cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Present
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkStatus(selectedReg.id, 'LATE', undefined, selectedReg.studentName);
                      setSelectedReg({ ...selectedReg, attendance: { ...selectedReg.attendance, attended: true, status: 'LATE' } });
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border border-amber-500/30 cursor-pointer flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5" /> Late
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkStatus(selectedReg.id, 'ABSENT', undefined, selectedReg.studentName);
                      setSelectedReg({ ...selectedReg, attendance: { ...selectedReg.attendance, attended: false, status: 'ABSENT' } });
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 border border-rose-500/30 cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Absent
                  </button>
                </div>
              </div>

              {/* Student Academic & Contact Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Email</span>
                  <div className="font-semibold mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>{selectedReg.email}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                  <div className="font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{selectedReg.phone || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Department & Year</span>
                  <div className="font-semibold mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>{selectedReg.department} ({selectedReg.year})</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance Rate</span>
                  <div className="font-bold text-emerald-500 mt-0.5">{selectedReg.overallAttendancePercentage ?? (selectedReg.attendance?.attended ? 100 : 0)}%</div>
                </div>
              </div>

              {/* Squad Members Details */}
              {selectedReg.membersList && selectedReg.membersList.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 block">
                    Squad Members & Individual Status ({selectedReg.membersList.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedReg.membersList.map((m) => {
                      const isMemberPresent = m.attendanceStatus === 'PRESENT' || m.attendanceStatus === 'LATE';
                      const isReplaced = m.attendanceStatus === 'REPLACED';
                      return (
                        <div
                          key={m.id}
                          className="p-3 rounded-xl border flex items-center justify-between gap-2"
                          style={{
                            backgroundColor: isReplaced ? 'rgba(100,116,139,0.06)' : 'var(--surface-raised)',
                            borderColor: 'var(--border-default)',
                            opacity: isReplaced ? 0.6 : 1,
                          }}
                        >
                          <div>
                            <div className="font-bold text-xs flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                              <span>{m.name}</span>
                              {m.isLead && <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600">Lead</span>}
                              {m.isReplacementMember && <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600">Replacement</span>}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">{m.rollNumber} • {m.department}</div>
                            {m.replacementInfo && (
                              <div className="text-[9px] text-purple-500 mt-0.5">
                                Substituted for: {m.replacementInfo.reason}
                              </div>
                            )}
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isMemberPresent ? 'bg-emerald-500/15 text-emerald-600' : isReplaced ? 'bg-slate-500/15 text-slate-400' : 'bg-rose-500/15 text-rose-600'
                          }`}>
                            {m.attendanceStatus}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Form Responses */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-indigo-500">
                  Dynamic Registration Form Submissions
                </h4>
                {(!selectedReg.customResponses || Object.keys(selectedReg.customResponses).length === 0) ? (
                  <div className="p-3 rounded-xl border text-slate-400 italic" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                    No custom form fields were configured for this submission.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(selectedReg.customResponses).map(([key, value]) => {
                      const matchedField = event.registrationForm.find((f) => f.id === key);
                      const label = matchedField ? matchedField.label : key;
                      return (
                        <div key={key} className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                          <div className="text-[11px] font-semibold text-slate-400 mb-1">{label}</div>
                          <div className="font-medium whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                            {String(value) || <span className="text-slate-400 italic">Not provided</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Substitution Audit History if any */}
              {selectedReg.replacementHistory && selectedReg.replacementHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-500 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> Substitution Audit Trail
                  </h4>
                  <div className="space-y-2">
                    {selectedReg.replacementHistory.map((hist) => (
                      <div key={hist.id} className="p-3 rounded-xl border bg-purple-500/5 border-purple-500/20 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Replaced by <strong>{hist.replacedByActorName}</strong> ({hist.replacedByActorRole})</span>
                          <span>{new Date(hist.replacedAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="font-semibold text-slate-300">
                          Swapped <span className="text-rose-400">{hist.originalMember.name}</span> with <span className="text-emerald-400">{hist.newMember.name}</span>
                        </div>
                        <div className="text-slate-400 italic">Reason: "{hist.reason}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 z-10" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surface-raised)' }}>
              <button
                onClick={() => setSelectedReg(null)}
                className="px-5 py-2 rounded-xl border font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
