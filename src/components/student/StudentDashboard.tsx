import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EventItem, Registration, Certificate } from '../../types';
import {
  GraduationCap,
  Calendar,
  Sparkles,
  QrCode,
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
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentDashboardProps {
  onOpenVerificationModal: (certId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenVerificationModal,
}) => {
  const {
    currentUser,
    events,
    registrations,
    certificates,
    registerStudent,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'MY_EVENTS' | 'MY_CERTS'>('EXPLORE');
  const [selectedEventForReg, setSelectedEventForReg] = useState<EventItem | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [searchEvent, setSearchEvent] = useState('');

  // Student registrations & certificates
  const studentEmail = currentUser?.email?.toLowerCase() || '';
  const studentRoll = currentUser?.studentRollNo?.toLowerCase() || '';

  const myRegistrations = registrations.filter(
    (r) =>
      r.studentId === currentUser?.id ||
      r.email?.toLowerCase() === studentEmail ||
      r.rollNumber?.toLowerCase() === studentRoll
  );

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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 pb-16">
      {/* Top Banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-300 font-bold text-[10px] uppercase tracking-wider">
                  Participant Portal
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-medium">{currentUser?.name} ({currentUser?.studentRollNo})</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-100 tracking-tight">
                My Academic Events & Credentials
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span>{currentUser?.department}</span>
                <span>•</span>
                <span>{currentUser?.year}</span>
                <span>•</span>
                <span className="text-sky-400 font-medium">{myRegistrations.length} Active Registrations</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('EXPLORE')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'EXPLORE'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Browse Events</span>
              </button>

              <button
                onClick={() => setActiveTab('MY_EVENTS')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'MY_EVENTS'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>My Events ({myRegistrations.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('MY_CERTS')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'MY_CERTS'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>My Certificates ({myCertificates.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* TAB 1: MY REGISTERED EVENTS & PASSES */}
        {activeTab === 'MY_EVENTS' && (
          <div className="space-y-6">
            {myRegistrations.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-200">You haven't registered for any events yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Browse live hackathons, paper presentations, and bootcamps to enroll and receive your QR check-in badge.
                </p>
                <button
                  onClick={() => setActiveTab('EXPLORE')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl"
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

                  return (
                    <div
                      key={reg.id}
                      className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6"
                    >
                      {/* Event Banner */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                              {event.type}
                            </span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Registration Confirmed
                            </span>
                          </div>
                          <h2 className="text-xl font-display font-bold text-slate-100">{event.title}</h2>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-sky-400" /> {event.date} ({event.startTime} - {event.endTime})
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-400" /> {event.venue}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-mono block">Pass Reference ID</span>
                          <span className="font-mono text-xs text-slate-300 font-bold">{reg.id}</span>
                        </div>
                      </div>

                      {/* QR Check-in Pass Card */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-950 p-6 rounded-2xl border border-indigo-500/30">
                        {/* QR Box */}
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                          <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-lg flex items-center justify-center mb-2">
                            <QrCode className="w-32 h-32 text-slate-950" />
                          </div>
                          <span className="text-[10px] font-mono text-indigo-400 font-bold">
                            {reg.rollNumber} • QR PASS
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1">
                            Show this at entry gate scanner
                          </span>
                        </div>

                        {/* Middle: Attendance & Check-in Details */}
                        <div className="space-y-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Live Attendance Status</span>
                            <div className="text-sm font-bold mt-1">
                              {reg.attendance?.attended ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" /> Present & Verified
                                </span>
                              ) : (
                                <span className="text-amber-400 flex items-center gap-1">
                                  <Clock className="w-4 h-4" /> Pending Check-in at Entry Gate
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Team Information</span>
                            <div className="text-sm font-bold text-slate-200 mt-0.5">
                              {reg.teamName ? `Team: ${reg.teamName}` : 'Individual Participant'}
                            </div>
                          </div>
                        </div>

                        {/* Right: Jury Panel & Room Allocation */}
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                          <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> Jury & Presentation Slot
                          </span>

                          {allocation ? (
                            <div className="space-y-1.5 pt-1">
                              <div>
                                <span className="text-slate-500 text-[10px]">Assigned Panel:</span>
                                <div className="font-semibold text-slate-200">{allocation.panelName}</div>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px]">Room & Location:</span>
                                <div className="font-semibold text-amber-300 font-mono">{allocation.room}</div>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px]">Scheduled Window:</span>
                                <div className="font-semibold text-indigo-300 font-mono">{allocation.timeSlot}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-400 italic text-[11px] pt-1">
                              Panel scheduling in progress by organizers. Check back before opening remarks.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Round Progression Checklist */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          My Event Progression Stages
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>1. Enrolled</span>
                          </div>

                          <div
                            className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                              reg.attendance?.attended
                                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            {reg.attendance?.attended ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            <span>2. Checked In</span>
                          </div>

                          <div
                            className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                              reg.roundTracking.round1Completed
                                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            {reg.roundTracking.round1Completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            <span>3. Round 1</span>
                          </div>

                          <div
                            className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                              reg.roundTracking.round2Completed
                                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            {reg.roundTracking.round2Completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            <span>4. Round 2</span>
                          </div>

                          <div
                            className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                              reg.roundTracking.finalPresentation
                                ? 'bg-amber-950/40 border-amber-500/30 text-amber-300 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}
                          >
                            {reg.roundTracking.finalPresentation ? <Trophy className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            <span>5. Final Jury</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPLORE & REGISTER */}
        {activeTab === 'EXPLORE' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchEvent}
                  onChange={(e) => setSearchEvent(e.target.value)}
                  placeholder="Search hackathons, bootcamps, workshops..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => {
                const eventRegCount = registrations.filter((r) => r.eventId === evt.id).length;
                const isFull = eventRegCount >= evt.maxStudents;
                const isRegistered = myRegistrations.some((r) => r.eventId === evt.id);

                return (
                  <div
                    key={evt.id}
                    className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-500/30">
                          {evt.type}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {eventRegCount} / {evt.maxStudents} Enrolled
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-100 mb-2">{evt.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {evt.description}
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                          <span>{evt.date} • {evt.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span>{evt.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Max Team Size: {evt.teamSizeMax} Members</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 mt-4 border-t border-slate-800/80">
                      {isRegistered ? (
                        <div className="w-full py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Registered</span>
                        </div>
                      ) : isFull ? (
                        <div className="w-full py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold text-center">
                          Registration Closed (Full)
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenRegistration(evt)}
                          className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Register with AI Smart Form</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MY CERTIFICATES & CREDENTIALS */}
        {activeTab === 'MY_CERTS' && (
          <div className="space-y-6">
            {myCertificates.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <Award className="w-10 h-10 text-amber-400/60 mx-auto" />
                <h3 className="text-base font-bold text-slate-200">No Certificates Issued Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Certificates are automatically evaluated and generated after event attendance and completion of presentation rounds.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 shadow-xl space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                          <Award className="w-4 h-4" />
                          <span>{cert.templateStyle.collegeLogoText}</span>
                        </div>
                        <h3 className="text-base font-display font-bold text-slate-100 mt-1">
                          {cert.eventTitle}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Issued on {cert.issueDate}
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                        {cert.positionTitle || cert.recipientRole}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Unique Credential ID</span>
                        <span className="font-mono text-indigo-300 font-semibold">{cert.certificateId}</span>
                      </div>
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => onOpenVerificationModal(cert.certificateId)}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>View Verified Certificate</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Registration Modal */}
      {selectedEventForReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 pb-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400">
                  {selectedEventForReg.type} Registration
                </span>
                <h3 className="text-base font-display font-bold text-slate-100">
                  {selectedEventForReg.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventForReg(null)}
                className="p-1.5 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
                  {regError}
                </div>
              )}

              {regSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* Student Identity Auto-Filled */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Applicant Identity</span>
                <div className="font-semibold text-slate-200">
                  {currentUser?.name} • Roll: {currentUser?.studentRollNo} ({currentUser?.department})
                </div>
              </div>

              {/* Dynamically Rendered AI Form Fields */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Event-Specific Questions ({selectedEventForReg.registrationForm.length})
                </span>

                {selectedEventForReg.registrationForm.map((field) => (
                  <div key={field.id}>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {field.label} {field.required && <span className="text-rose-400">*</span>}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        required={field.required}
                        rows={2}
                        placeholder={field.placeholder}
                        value={formResponses[field.id] || ''}
                        onChange={(e) => setFormResponses({ ...formResponses, [field.id]: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        required={field.required}
                        value={formResponses[field.id] || ''}
                        onChange={(e) => setFormResponses({ ...formResponses, [field.id]: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
                      >
                        <option value="">Select an option...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formResponses[field.id] || ''}
                        onChange={(e) => setFormResponses({ ...formResponses, [field.id]: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedEventForReg(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Complete Registration & Generate QR Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
