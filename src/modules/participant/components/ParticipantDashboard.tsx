'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useTheme } from '../../../context/ThemeContext';
import { EventItem, Registration, Certificate } from '../../../types';
import {
  GraduationCap,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Search,
  ExternalLink,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Trophy,
  AlertTriangle,
  XCircle,
  History,
  Check,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ParticipantDashboardProps {
  onOpenVerificationModal: (certId: string) => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  onOpenVerificationModal,
}) => {
  const {
    currentUser,
    events,
    registrations,
    certificates,
    registerStudent,
  } = useApp();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'MY_EVENTS' | 'MY_CERTS'>('EXPLORE');
  const [selectedEventForReg, setSelectedEventForReg] = useState<EventItem | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [searchEvent, setSearchEvent] = useState('');

  // Student registrations & certificates
  const studentEmail = currentUser?.email?.toLowerCase() || '';
  const studentRoll = currentUser?.studentRollNo?.toLowerCase() || '';

  const myRegistrations = registrations.filter((r) => {
    if (r.studentId === currentUser?.id) return true;
    if (r.email?.toLowerCase() === studentEmail) return true;
    if (r.rollNumber?.toLowerCase() === studentRoll) return true;
    if (r.membersList && r.membersList.some(m => m.email?.toLowerCase() === studentEmail || m.rollNumber?.toLowerCase() === studentRoll)) return true;
    return false;
  });

  const myCertificates = certificates.filter(
    (c) =>
      c.recipientId === currentUser?.id ||
      c.recipientEmail?.toLowerCase() === studentEmail ||
      c.recipientRollNo?.toLowerCase() === studentRoll
  );

  const handleOpenRegistration = (event: EventItem) => {
    setSelectedEventForReg(event);
    setFormResponses({});
    setRegError(null);
    setRegSuccess(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForReg) return;

    const res = registerStudent(
      selectedEventForReg.id,
      {
        studentName: currentUser?.name,
        rollNumber: currentUser?.studentRollNo,
        email: currentUser?.email,
        phone: currentUser?.phone,
        department: currentUser?.department,
        year: currentUser?.year,
        section: currentUser?.section,
      },
      formResponses
    );

    if (res.success) {
      setRegSuccess(res.message);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        setSelectedEventForReg(null);
        setActiveTab('MY_EVENTS');
      }, 1800);
    } else {
      setRegError(res.message);
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchEvent.toLowerCase()) ||
      e.type.toLowerCase().includes(searchEvent.toLowerCase()) ||
      e.organizingDepartment.toLowerCase().includes(searchEvent.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-16 transition-colors duration-300" style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--text-primary)' }}>
      {/* Top Banner */}
      <div className="border-b" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surface-base)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider" style={{ backgroundColor: 'var(--role-student-bg)', color: 'var(--role-student-color)', border: `1px solid ${isDark ? 'rgba(2,132,199,0.3)' : 'rgba(2,132,199,0.2)'}` }}>
                  Participant Portal
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{currentUser?.name} ({currentUser?.studentRollNo})</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                My Academic Events & Credentials
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                <span>{currentUser?.department}</span>
                <span>•</span>
                <span>{currentUser?.year}</span>
                <span>•</span>
                <span className="text-sky-500 font-semibold">{myRegistrations.length} Active Registrations</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border p-1 rounded-2xl" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
              <button
                onClick={() => setActiveTab('EXPLORE')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'EXPLORE'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'hover:bg-slate-500/10'
                }`}
                style={{ color: activeTab === 'EXPLORE' ? '#ffffff' : 'var(--text-secondary)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Browse Events</span>
              </button>

              <button
                onClick={() => setActiveTab('MY_EVENTS')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'MY_EVENTS'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'hover:bg-slate-500/10'
                }`}
                style={{ color: activeTab === 'MY_EVENTS' ? '#ffffff' : 'var(--text-secondary)' }}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>My Events ({myRegistrations.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('MY_CERTS')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'MY_CERTS'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'hover:bg-slate-500/10'
                }`}
                style={{ color: activeTab === 'MY_CERTS' ? '#ffffff' : 'var(--text-secondary)' }}
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>My Certificates ({myCertificates.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

        {/* TAB 1: MY REGISTERED EVENTS & LIVE ATTENDANCE STATUS */}
        {activeTab === 'MY_EVENTS' && (
          <div className="space-y-6">
            {myRegistrations.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
                <Calendar className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>You haven't registered for any events yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Browse collegiate hackathons, symposiums, and coding contests to enroll and track your live roster status.
                </p>
                <button
                  onClick={() => setActiveTab('EXPLORE')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Explore Active Events
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {myRegistrations.map((reg) => {
                  const event = events.find((e) => e.id === reg.eventId);
                  if (!event) return null;

                  // Find allocation slot for this team / student
                  const allocation = event.allocations?.find(
                    (a) =>
                      a.teamName.toLowerCase() === (reg.teamName || reg.studentName).toLowerCase() ||
                      a.teamName.toLowerCase().includes(reg.studentName.toLowerCase())
                  );

                  const members = reg.membersList || [
                    {
                      id: `single_${reg.id}`,
                      name: reg.studentName,
                      rollNumber: reg.rollNumber,
                      email: reg.email,
                      phone: reg.phone,
                      department: reg.department,
                      attendanceStatus: reg.attendance?.status || (reg.attendance?.attended ? 'PRESENT' : 'ABSENT'),
                      isActive: true,
                      isLead: true,
                    },
                  ];

                  const isTeam = Boolean(reg.teamName && members.length > 1);
                  const isAttended = reg.attendance?.attended;

                  return (
                    <div
                      key={reg.id}
                      className="p-6 rounded-3xl border space-y-6 transition-all"
                      style={{
                        backgroundColor: 'var(--surface-base)',
                        borderColor: isAttended ? 'rgba(5,150,105,0.25)' : 'var(--border-default)',
                      }}
                    >
                      {/* Event Banner */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--role-student-bg)', color: 'var(--role-student-color)' }}>
                              {event.type}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Registration Confirmed
                            </span>
                            {event.isRosterFinalized && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                                Active Roster Finalized
                              </span>
                            )}
                          </div>
                          <h2 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{event.title}</h2>
                          <div className="flex flex-wrap items-center gap-4 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-sky-500" /> {event.date} ({event.startTime} - {event.endTime})
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-500" /> {event.venue}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-mono block">Roster Reference ID</span>
                          <span className="font-mono text-xs font-bold text-sky-500">{reg.id}</span>
                        </div>
                      </div>

                      {/* Live Attendance & Active Roster Status Card */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch p-6 rounded-2xl border" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                        {/* Attendance Status Badge Card */}
                        <div className="flex flex-col items-center justify-center p-5 rounded-2xl border text-center" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                            style={{
                              backgroundColor: isAttended ? 'rgba(5,150,105,0.12)' : 'rgba(239,68,68,0.12)',
                              color: isAttended ? '#059669' : '#ef4444',
                              border: `1px solid ${isAttended ? 'rgba(5,150,105,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            }}
                          >
                            {isAttended ? <UserCheck className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                          </div>

                          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: isAttended ? '#059669' : '#ef4444' }}>
                            {reg.attendance?.status === 'LATE' ? 'Late Arrival Marked' : isAttended ? 'Verified Present' : 'Attendance Pending'}
                          </span>

                          <span className="text-[11px] text-slate-400 mt-1">
                            {isAttended && reg.attendance?.timestamp
                              ? `Logged at ${new Date(reg.attendance.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              : 'Report to desk on arrival'}
                          </span>

                          <div className="mt-3 pt-3 border-t w-full text-[11px]" style={{ borderColor: 'var(--border-default)' }}>
                            <span className="text-slate-400">Attendance Score: </span>
                            <strong className="text-emerald-500">{reg.overallAttendancePercentage ?? (isAttended ? 100 : 0)}%</strong>
                          </div>
                        </div>

                        {/* Team Roster & Replacement Details */}
                        <div className="md:col-span-2 space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                {isTeam ? `Squad Roster: ${reg.teamName}` : 'Participant Details'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                reg.teamEligibility === 'INCOMPLETE_TEAM'
                                  ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                              }`}>
                                {reg.teamEligibility === 'INCOMPLETE_TEAM' ? '⚠️ Incomplete Squad' : '✓ Eligible for Evaluation'}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {members.map((m) => {
                                const isMemberPresent = m.attendanceStatus === 'PRESENT' || m.attendanceStatus === 'LATE';
                                const isReplaced = m.attendanceStatus === 'REPLACED';

                                return (
                                  <div
                                    key={m.id}
                                    className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
                                    style={{
                                      backgroundColor: isReplaced ? 'rgba(100,116,139,0.06)' : 'var(--surface-base)',
                                      borderColor: 'var(--border-default)',
                                      opacity: isReplaced ? 0.6 : 1,
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                                      <span className="font-mono text-[10px] text-sky-500">({m.rollNumber})</span>
                                      {m.isLead && <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600">Lead</span>}
                                      {m.isReplacementMember && <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600">Replacement</span>}
                                    </div>

                                    <span
                                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                      style={{
                                        backgroundColor: isMemberPresent ? 'rgba(5,150,105,0.15)' : isReplaced ? 'rgba(148,163,184,0.2)' : 'rgba(239,68,68,0.15)',
                                        color: isMemberPresent ? '#059669' : isReplaced ? '#64748b' : '#ef4444',
                                      }}
                                    >
                                      {m.attendanceStatus}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Certificate Progress Callout */}
                          <div className="p-3 rounded-xl border flex items-center justify-between text-xs" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-amber-500" />
                              <span style={{ color: 'var(--text-secondary)' }}>E-Certificate Eligibility:</span>
                            </div>
                            <span className="font-bold text-emerald-500">
                              {reg.certificateStatus === 'GENERATED' || reg.certificateStatus === 'ELIGIBLE'
                                ? '✓ Eligible upon Event Completion'
                                : 'Requires Minimum 75% Attendance'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Allocated Jury Panel & Evaluation Slot */}
                      {allocation && (
                        <div className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Assigned Jury Panel & Time Slot</span>
                            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{allocation.panelName}</div>
                            <div className="text-xs text-slate-400">
                              Room: <strong className="text-amber-500">{allocation.room}</strong> • Time: <strong className="text-sky-500">{allocation.timeSlot}</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {allocation.score !== undefined && (
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Jury Score</span>
                                <span className="font-display font-extrabold text-lg text-emerald-500">
                                  {allocation.score} / {allocation.maxScore || 100}
                                </span>
                              </div>
                            )}

                            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                              allocation.status === 'COMPLETED'
                                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                                : 'bg-indigo-500/15 text-indigo-600 border border-indigo-500/30'
                            }`}>
                              {allocation.status}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPLORE EVENTS & ENROLL */}
        {activeTab === 'EXPLORE' && (
          <div className="space-y-6">
            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchEvent}
                onChange={(e) => setSearchEvent(e.target.value)}
                placeholder="Search hackathons, bootcamps, workshops..."
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl border text-xs focus:outline-none focus:border-sky-500 transition-all"
                style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => {
                const isRegistered = myRegistrations.some((r) => r.eventId === evt.id);
                const regCount = registrations.filter((r) => r.eventId === evt.id).length;

                return (
                  <div
                    key={evt.id}
                    className="p-6 rounded-3xl border flex flex-col justify-between gap-5 transition-all hover:shadow-xl duration-200"
                    style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'var(--role-student-bg)', color: 'var(--role-student-color)' }}>
                          {evt.type}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {regCount} / {evt.maxStudents} Enrolled
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-base line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                        {evt.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="space-y-2 text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-sky-500" />
                          <span>{evt.date} • {evt.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          <span>{evt.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Max Team Size: {evt.teamSizeMax} Members</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
                      {isRegistered ? (
                        <button
                          type="button"
                          onClick={() => setActiveTab('MY_EVENTS')}
                          className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Registered • View Roster</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenRegistration(evt)}
                          className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Register for Event</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MY CERTIFICATES */}
        {activeTab === 'MY_CERTS' && (
          <div className="space-y-6">
            {myCertificates.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border space-y-3" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
                <Award className="w-10 h-10 text-amber-500 mx-auto opacity-50" />
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>No verified certificates issued yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Certificates are automatically generated and cryptographically signed after events are completed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-6 rounded-3xl border flex flex-col justify-between gap-5 transition-all"
                    style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/30">
                          {cert.recipientRole} Award
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{cert.certificateId}</span>
                      </div>

                      <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>{cert.eventTitle}</h3>
                      <div className="text-xs font-semibold text-sky-500 mt-1">{cert.positionTitle}</div>
                      <div className="text-xs text-slate-400 mt-2">Issued to {cert.recipientName} ({cert.recipientRollNo}) on {cert.issueDate}</div>
                    </div>

                    <div className="pt-4 border-t flex items-center gap-2" style={{ borderColor: 'var(--border-default)' }}>
                      <button
                        type="button"
                        onClick={() => onOpenVerificationModal(cert.certificateId)}
                        className="flex-1 py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Verify Authenticity</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenVerificationModal(cert.certificateId)}
                        className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer"
                        title="Download / Print Certificate"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* REGISTRATION FORM MODAL */}
      {selectedEventForReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden animate-scale-in" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
              <div>
                <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                  Enroll in {selectedEventForReg.title}
                </h3>
                <p className="text-xs text-slate-400">Complete the form to register your squad on the active roster.</p>
              </div>
              <button onClick={() => setSelectedEventForReg(null)} className="p-1.5 text-slate-400 hover:text-slate-200 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {selectedEventForReg.registrationForm.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={formResponses[field.id] || ''}
                      onChange={(e) => setFormResponses({ ...formResponses, [field.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
                      required={field.required}
                      placeholder={field.placeholder || ''}
                      value={formResponses[field.id] || ''}
                      onChange={(e) => setFormResponses({ ...formResponses, [field.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  )}
                  {field.helpText && <p className="text-[10px] text-slate-400">{field.helpText}</p>}
                </div>
              ))}

              <div className="pt-3 border-t flex justify-end gap-2" style={{ borderColor: 'var(--border-default)' }}>
                <button
                  type="button"
                  onClick={() => setSelectedEventForReg(null)}
                  className="px-4 py-2 rounded-xl border font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
                >
                  Confirm Event Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
