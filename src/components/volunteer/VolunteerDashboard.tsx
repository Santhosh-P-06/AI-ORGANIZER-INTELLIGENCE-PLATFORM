import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Search,
  Clock,
  MapPin,
  Mail,
  Phone,
  Layers,
  Sparkles,
  Camera,
  Activity,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VolunteerDashboard: React.FC = () => {
  const {
    events,
    activeEventId,
    setActiveEventId,
    currentUser,
    registrations,
    recordQRAttendance,
    recordManualAttendance,
    updateRoundTracking,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'SCANNER' | 'SCHEDULE' | 'ROUNDS'>('SCANNER');
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const eventRegs = activeEvent ? registrations.filter((r) => r.eventId === activeEvent.id) : [];

  // Find my volunteer assignment in this event
  const myAssignment = activeEvent?.volunteerAssignments?.find(
    (va) =>
      va.volunteerEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
      va.volunteerName?.toLowerCase() === currentUser?.name?.toLowerCase()
  ) || {
    role: 'QR Check-in & Attendance Lead',
    assignedLocation: 'Auditorium Main Entry Gate',
    timeSlot: '08:30 AM - 01:00 PM',
    status: 'CHECKED_IN',
  };

  const handleScanSubmit = (inputVal?: string) => {
    const target = (inputVal || qrInput).trim();
    if (!target || !activeEvent || !currentUser) return;

    const res = recordQRAttendance(activeEvent.id, target, currentUser);
    setScanResult(res);

    if (res.success && !res.message.includes('ALREADY')) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }

    setQrInput('');
  };

  const sampleQRs = [
    { label: 'Rahul K (21CS042)', val: '21CS042' },
    { label: 'Sneha R (22IT019)', val: '22IT019' },
    { label: 'Vikram A (20EC099)', val: '20EC099' },
  ];

  const filteredRegs = eventRegs.filter(
    (r) =>
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.teamName && r.teamName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const presentCount = eventRegs.filter((r) => r.attendance?.attended).length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 pb-16">
      {/* Top Banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] uppercase tracking-wider">
                  Volunteer Operations Desk
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-medium">{currentUser?.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-100 tracking-tight">
                {activeEvent?.title || 'College Event'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <MapPin className="w-3.5 h-3.5" /> Station: {myAssignment.assignedLocation}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> Slot: {myAssignment.timeSlot}
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" /> Checked In: {presentCount} / {eventRegs.length}
                </span>
              </div>
            </div>

            {/* Event Switcher */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
              <Layers className="w-4 h-4 text-emerald-400" />
              <select
                value={activeEventId}
                onChange={(e) => setActiveEventId(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id} className="bg-slate-900 text-slate-200">
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4">
            <button
              onClick={() => setActiveTab('SCANNER')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'SCANNER'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QR Attendance Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('ROUNDS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ROUNDS'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Round Progression Tracker</span>
            </button>

            <button
              onClick={() => setActiveTab('SCHEDULE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'SCHEDULE'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>My Volunteer Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* TAB 1: QR ATTENDANCE SCANNER */}
        {activeTab === 'SCANNER' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Scanner Camera Simulation & Manual Check-in */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base font-display font-bold text-slate-100">
                      Live QR Code Badge Scanner
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                    Scanner Online
                  </span>
                </div>

                {/* Simulated Optical Viewfinder */}
                <div className="relative h-64 bg-slate-950 rounded-2xl border-2 border-dashed border-emerald-500/40 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-lg shadow-emerald-500/50" />

                  <Camera className="w-10 h-10 text-emerald-400 mb-2 animate-bounce" />
                  <p className="text-xs text-slate-300 font-semibold">
                    Point Student Mobile QR Badge at Camera or Enter Roll Number
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                    Optical high-speed verification stamps arrival timestamp and prevents duplicate entry.
                  </p>
                </div>

                {/* Scan Result Feedback Message */}
                {scanResult && (
                  <div
                    className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
                      scanResult.success && !scanResult.message.includes('ALREADY')
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
                        : scanResult.message.includes('ALREADY')
                        ? 'bg-amber-950/70 text-amber-300 border-amber-500/50'
                        : 'bg-rose-950/70 text-rose-300 border-rose-500/50'
                    }`}
                  >
                    {scanResult.success ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="font-semibold">{scanResult.message}</span>
                  </div>
                )}

                {/* Manual Roll Number / ID Search & Scan Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleScanSubmit();
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      placeholder="Scan QR data string or Enter Roll No (e.g. 21CS042)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer"
                  >
                    Verify & Check In
                  </button>
                </form>

                {/* Quick Test Barcodes */}
                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-2">
                    Quick Sample Student Badges (For Live Testing):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sampleQRs.map((s) => (
                      <button
                        key={s.val}
                        type="button"
                        onClick={() => handleScanSubmit(s.val)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-emerald-400 font-mono transition-colors"
                      >
                        + Scan {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Live Check-in Activity Feed */}
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Live Verified Attendees ({presentCount})
                </span>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {eventRegs
                  .filter((r) => r.attendance?.attended)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{r.studentName}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {r.attendance?.timestamp ? new Date(r.attendance.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {r.rollNumber} • {r.teamName || 'Individual'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Verified by {r.attendance?.volunteerName || 'Gate Volunteer'}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROUND PROGRESSION TRACKER */}
        {activeTab === 'ROUNDS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Live Stage & Evaluation Tracker</h3>
                <p className="text-xs text-slate-400">Update presentation completion for teams in your zone</p>
              </div>

              <div className="relative max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter student or team..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Student / Roll</th>
                    <th className="p-3.5">Team</th>
                    <th className="p-3.5">Attendance</th>
                    <th className="p-3.5 text-center">Round 1 Done</th>
                    <th className="p-3.5 text-center">Round 2 Done</th>
                    <th className="p-3.5 text-center">Final Presentation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRegs.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-900/50">
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{reg.studentName}</div>
                        <div className="text-[11px] font-mono text-indigo-400">{reg.rollNumber}</div>
                      </td>

                      <td className="p-3.5 font-medium text-slate-300">
                        {reg.teamName || <span className="text-slate-600">Individual</span>}
                      </td>

                      <td className="p-3.5">
                        {reg.attendance?.attended ? (
                          <span className="text-emerald-400 font-semibold">✓ Present</span>
                        ) : (
                          <button
                            onClick={() => recordManualAttendance(reg.id, true, currentUser?.name || 'Volunteer')}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold"
                          >
                            Mark Present
                          </button>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(reg.roundTracking.round1Completed)}
                          onChange={(e) => updateRoundTracking(reg.id, 'round1Completed', e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 cursor-pointer"
                        />
                      </td>

                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(reg.roundTracking.round2Completed)}
                          onChange={(e) => updateRoundTracking(reg.id, 'round2Completed', e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 cursor-pointer"
                        />
                      </td>

                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(reg.roundTracking.finalPresentation)}
                          onChange={(e) => updateRoundTracking(reg.id, 'finalPresentation', e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: VOLUNTEER SCHEDULE & COORDINATOR CONTACT */}
        {activeTab === 'SCHEDULE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>My Assigned Volunteer Duty</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Designated Role</span>
                  <div className="text-sm font-bold text-emerald-300 mt-0.5">{myAssignment.role}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Assigned Station</span>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{myAssignment.assignedLocation}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Duty Hours</span>
                  <div className="text-sm font-bold font-mono text-sky-300 mt-0.5">{myAssignment.timeSlot}</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>Faculty Coordinator Contact</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Chief Coordinator</span>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{activeEvent.coordinatorName}</div>
                  <div className="text-[11px] text-slate-400">{activeEvent.organizingDepartment}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Emergency Phone</span>
                  <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">{activeEvent.contactNumber}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Official Help Email</span>
                  <div className="text-sm font-bold font-mono text-slate-300 mt-0.5">{activeEvent.contactEmail}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
