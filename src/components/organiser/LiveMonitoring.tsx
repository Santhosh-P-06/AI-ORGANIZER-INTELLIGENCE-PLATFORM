import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EventItem, Registration } from '../../types';
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
  } = useApp();

  const eventRegs = registrations.filter((r) => r.eventId === event.id);
  const presentCount = eventRegs.filter((r) => r.attendance?.attended).length;
  const absentCount = eventRegs.length - presentCount;
  const attendanceRate = eventRegs.length > 0 ? Math.round((presentCount / eventRegs.length) * 100) : 0;

  const round1DoneCount = eventRegs.filter((r) => r.roundTracking.round1Completed).length;
  const round2DoneCount = eventRegs.filter((r) => r.roundTracking.round2Completed).length;
  const finalDoneCount = eventRegs.filter((r) => r.roundTracking.finalPresentation).length;

  const r1Percent = presentCount > 0 ? Math.round((round1DoneCount / presentCount) * 100) : 0;
  const r2Percent = presentCount > 0 ? Math.round((round2DoneCount / presentCount) * 100) : 0;
  const finalPercent = presentCount > 0 ? Math.round((finalDoneCount / presentCount) * 100) : 0;

  const handlePublishResults = () => {
    publishEventResults(event.id);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Live Status Header */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3 h-3 text-rose-400 animate-pulse" /> LIVE TRACKING
              </span>
              <span className="text-xs text-slate-400 font-medium">{event.title}</span>
            </div>
            <h2 className="text-xl font-display font-bold text-slate-100 mt-0.5">
              Event Operational Command Center
            </h2>
          </div>
        </div>

        <div>
          {!event.resultsPublished ? (
            <button
              onClick={handlePublishResults}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Publish Official Event Results & Rankings</span>
            </button>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Results & Awards Published</span>
            </span>
          )}
        </div>
      </div>

      {/* Real-time KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Registered</div>
          <div className="text-2xl font-bold font-display text-slate-100 mt-1">{eventRegs.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Confirmed participants</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Present (QR Verified)</div>
          <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
            {presentCount} <span className="text-xs font-normal text-slate-400">({attendanceRate}%)</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Scanned at check-in</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Absent / Pending Arrival</div>
          <div className="text-2xl font-bold font-display text-rose-400 mt-1">{absentCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Not scanned yet</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Final Stage Completed</div>
          <div className="text-2xl font-bold font-display text-amber-400 mt-1">{finalDoneCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Teams evaluated by jury</div>
        </div>
      </div>

      {/* Progress Funnels: Round 1, Round 2, Final */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Live Round Progression Funnel
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Round 1: Screening / Pitch</span>
              <span className="font-mono text-indigo-400">{round1DoneCount} / {presentCount} ({r1Percent}%)</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${r1Percent}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Round 2: Technical Deep Dive</span>
              <span className="font-mono text-purple-400">{round2DoneCount} / {presentCount} ({r2Percent}%)</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${r2Percent}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Final Jury Presentation</span>
              <span className="font-mono text-amber-400">{finalDoneCount} / {presentCount} ({finalPercent}%)</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${finalPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Participant & Team Round Controller Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-100">
            Live Participant Round Tracking & Podium Ranking
          </span>
          <span className="text-xs text-slate-500">
            Toggle rounds or assign winner credentials
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Student / Team</th>
                <th className="p-3.5">Check-in</th>
                <th className="p-3.5 text-center">Round 1</th>
                <th className="p-3.5 text-center">Round 2</th>
                <th className="p-3.5 text-center">Final Pres</th>
                <th className="p-3.5">Award / Ranking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {eventRegs.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-900/50">
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-200">{reg.studentName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {reg.rollNumber} • {reg.teamName ? <span className="text-indigo-300 font-bold">{reg.teamName}</span> : 'Individual'}
                    </div>
                  </td>

                  <td className="p-3.5">
                    {reg.attendance?.attended ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Present
                      </span>
                    ) : (
                      <span className="text-slate-500">Absent</span>
                    )}
                  </td>

                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(reg.roundTracking.round1Completed)}
                      onChange={(e) => updateRoundTracking(reg.id, 'round1Completed', e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 cursor-pointer"
                    />
                  </td>

                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(reg.roundTracking.round2Completed)}
                      onChange={(e) => updateRoundTracking(reg.id, 'round2Completed', e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-600 cursor-pointer"
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

                  <td className="p-3.5">
                    <select
                      value={reg.roundTracking.winnerStatus || 'NONE'}
                      onChange={(e) => setTeamWinnerStatus(reg.id, e.target.value as any)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="NONE">Participant</option>
                      <option value="WINNER">🏆 Grand Champion (1st)</option>
                      <option value="RUNNER_UP_1">🥈 First Runner-Up (2nd)</option>
                      <option value="RUNNER_UP_2">🥉 Second Runner-Up (3rd)</option>
                      <option value="SPECIAL_MENTION">⭐ Special Jury Commendation</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
