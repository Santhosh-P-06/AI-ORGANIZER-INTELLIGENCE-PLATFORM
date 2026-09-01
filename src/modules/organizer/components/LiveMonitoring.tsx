'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useTheme } from '../../../context/ThemeContext';
import { EventItem, Registration } from '../../../types';
import {
  Activity,
  CheckCircle2,
  Clock,
  Users,
  Trophy,
  Award,
  AlertCircle,
  Radio,
  Send,
  Layers,
  MapPin,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Bell,
  Lock,
  Unlock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveMonitoringProps {
  event: EventItem;
}

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({ event }) => {
  const {
    registrations,
    updateRoundTracking,
    setTeamWinnerStatus,
    publishEventResults,
    sendAbsenceAlerts,
    finalizeActiveRoster,
  } = useApp();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  const eventRegs = registrations.filter((r) => r.eventId === event.id);
  const presentCount = eventRegs.filter((r) => r.attendance?.attended && r.attendance?.status !== 'LATE').length;
  const lateCount = eventRegs.filter((r) => r.attendance?.status === 'LATE').length;
  const totalAttended = presentCount + lateCount;
  const absentCount = eventRegs.filter((r) => !r.attendance?.attended).length;
  const incompleteTeams = eventRegs.filter((r) => r.teamEligibility === 'INCOMPLETE_TEAM');
  const replacedCount = eventRegs.reduce((acc, r) => acc + (r.replacementHistory?.length || 0), 0);
  const attendanceRate = eventRegs.length > 0 ? Math.round((totalAttended / eventRegs.length) * 100) : 0;

  const round1DoneCount = eventRegs.filter((r) => r.roundTracking.round1Completed).length;
  const round2DoneCount = eventRegs.filter((r) => r.roundTracking.round2Completed).length;
  const finalDoneCount = eventRegs.filter((r) => r.roundTracking.finalPresentation).length;

  const r1Percent = totalAttended > 0 ? Math.round((round1DoneCount / totalAttended) * 100) : 0;
  const r2Percent = totalAttended > 0 ? Math.round((round2DoneCount / totalAttended) * 100) : 0;
  const finalPercent = totalAttended > 0 ? Math.round((finalDoneCount / totalAttended) * 100) : 0;

  const handlePublishResults = () => {
    publishEventResults(event.id);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  };

  const handleSendAlerts = () => {
    const res = sendAbsenceAlerts(event.id);
    setAlertNotice(res.message);
    setTimeout(() => setAlertNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Live Status Header */}
      <div className="p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-500">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/40 text-rose-600 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3 h-3 text-rose-500 animate-pulse" /> LIVE COMMAND
              </span>
              <span className="text-xs text-slate-400 font-medium">{event.title}</span>
              {event.isRosterFinalized && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Active Roster Finalized
                </span>
              )}
            </div>
            <h2 className="text-xl font-display font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              Operational Tracking & Evaluation Matrix
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {absentCount > 0 && (
            <button
              type="button"
              onClick={handleSendAlerts}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer hover:bg-slate-500/10"
              style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>Send Attendance Reminders</span>
            </button>
          )}

          {!event.resultsPublished ? (
            <button
              type="button"
              onClick={handlePublishResults}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Broadcast Official Results & Rankings</span>
            </button>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Results & Awards Published</span>
            </span>
          )}
        </div>
      </div>

      {alertNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Bell className="w-4 h-4" />
          <span>{alertNotice}</span>
        </div>
      )}

      {/* Real-time KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-xs text-slate-400 font-medium">Total Registered</div>
          <div className="text-2xl font-bold font-display mt-1" style={{ color: 'var(--text-primary)' }}>{eventRegs.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Confirmed participants</div>
        </div>

        <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-xs text-emerald-500 font-medium">Active Present</div>
          <div className="text-2xl font-bold font-display text-emerald-500 mt-1">
            {totalAttended} <span className="text-xs font-normal text-slate-400">({attendanceRate}%)</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{presentCount} on-time, {lateCount} late</div>
        </div>

        <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-xs text-rose-500 font-medium">Absent (No-Show)</div>
          <div className="text-2xl font-bold font-display text-rose-500 mt-1">{absentCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Unverified check-in</div>
        </div>

        <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-xs text-amber-500 font-medium">Incomplete Squads</div>
          <div className="text-2xl font-bold font-display text-amber-500 mt-1">{incompleteTeams.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Below minimum team size</div>
        </div>

        <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-xs text-purple-500 font-medium">Substituted</div>
          <div className="text-2xl font-bold font-display text-purple-500 mt-1">{replacedCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Member replacements</div>
        </div>

        <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-xs text-indigo-500 font-medium">Final Stage Completed</div>
          <div className="text-2xl font-bold font-display text-indigo-500 mt-1">{finalDoneCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Teams evaluated by jury</div>
        </div>
      </div>

      {/* Progress Funnels: Round 1, Round 2, Final */}
      <div className="p-6 rounded-3xl border space-y-4" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          Live Round Progression Funnel (Active Roster)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Round 1: Screening / Pitch</span>
              <span className="font-mono text-indigo-500 font-bold">{round1DoneCount} / {totalAttended} ({r1Percent}%)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${r1Percent}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Round 2: Technical Deep Dive</span>
              <span className="font-mono text-purple-500 font-bold">{round2DoneCount} / {totalAttended} ({r2Percent}%)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${r2Percent}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Final Round: Jury Defense</span>
              <span className="font-mono text-amber-500 font-bold">{finalDoneCount} / {totalAttended} ({finalPercent}%)</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${finalPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Live Active Teams List & Evaluation Toggles */}
      <div className="overflow-x-auto rounded-3xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
        <table className="w-full text-left text-xs">
          <thead className="border-b uppercase text-[10px] tracking-wider" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
            <tr>
              <th className="p-4">Participant / Team</th>
              <th className="p-4">Attendance State</th>
              <th className="p-4 text-center">Round 1</th>
              <th className="p-4 text-center">Round 2</th>
              <th className="p-4 text-center">Final Presentation</th>
              <th className="p-4 text-right">Award Status</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
            {eventRegs.map((reg) => {
              const isAttended = reg.attendance?.attended;
              return (
                <tr key={reg.id} className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {reg.teamName || reg.studentName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {reg.studentName} • {reg.rollNumber} • {reg.department}
                    </div>
                    {reg.teamEligibility === 'INCOMPLETE_TEAM' && (
                      <span className="text-[10px] text-amber-500 font-bold block flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3" /> Incomplete Squad
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      reg.attendance?.status === 'LATE'
                        ? 'bg-amber-500/10 text-amber-600'
                        : isAttended
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {reg.attendance?.status || (isAttended ? 'PRESENT' : 'ABSENT')}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => updateRoundTracking(reg.id, 'round1Completed', !reg.roundTracking.round1Completed)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        reg.roundTracking.round1Completed
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border text-slate-400 hover:bg-slate-500/10'
                      }`}
                    >
                      {reg.roundTracking.round1Completed ? 'Passed ✓' : 'Mark'}
                    </button>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => updateRoundTracking(reg.id, 'round2Completed', !reg.roundTracking.round2Completed)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        reg.roundTracking.round2Completed
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'border text-slate-400 hover:bg-slate-500/10'
                      }`}
                    >
                      {reg.roundTracking.round2Completed ? 'Passed ✓' : 'Mark'}
                    </button>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => updateRoundTracking(reg.id, 'finalPresentation', !reg.roundTracking.finalPresentation)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        reg.roundTracking.finalPresentation
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'border text-slate-400 hover:bg-slate-500/10'
                      }`}
                    >
                      {reg.roundTracking.finalPresentation ? 'Completed ✓' : 'Mark'}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <select
                      value={reg.roundTracking.winnerStatus}
                      onChange={(e) => setTeamWinnerStatus(reg.id, e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    >
                      <option value="NONE">Participant</option>
                      <option value="WINNER">🥇 1st Place Winner</option>
                      <option value="RUNNER_UP_1">🥈 1st Runner-Up</option>
                      <option value="RUNNER_UP_2">🥉 2nd Runner-Up</option>
                      <option value="SPECIAL_MENTION">🎖️ Special Jury Award</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
