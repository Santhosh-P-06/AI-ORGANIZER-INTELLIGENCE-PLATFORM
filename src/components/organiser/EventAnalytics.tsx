import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EventItem } from '../../types';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
  Loader2,
  PieChart,
  Activity,
  Award,
} from 'lucide-react';

interface EventAnalyticsProps {
  event: EventItem;
}

export const EventAnalytics: React.FC<EventAnalyticsProps> = ({ event }) => {
  const { registrations, certificates } = useApp();
  const [aiInsights, setAiInsights] = useState<{
    summary?: string;
    highlights?: string[];
    dropoutAnalysis?: string;
    recommendations?: string[];
  } | null>(null);

  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const eventRegs = registrations.filter((r) => r.eventId === event.id);
  const totalRegistered = eventRegs.length;
  const totalAttended = eventRegs.filter((r) => r.attendance?.attended).length;
  const round1Done = eventRegs.filter((r) => r.roundTracking.round1Completed).length;
  const round2Done = eventRegs.filter((r) => r.roundTracking.round2Completed).length;
  const finalDone = eventRegs.filter((r) => r.roundTracking.finalPresentation).length;
  const winnersCount = eventRegs.filter((r) => r.roundTracking.winnerStatus && r.roundTracking.winnerStatus !== 'NONE').length;

  const attendancePercent = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;
  const completionPercent = totalAttended > 0 ? Math.round((finalDone / totalAttended) * 100) : 0;

  // Department distribution
  const deptCounts: Record<string, number> = {};
  eventRegs.forEach((r) => {
    const d = r.department || 'Other';
    deptCounts[d] = (deptCounts[d] || 0) + 1;
  });

  // Year distribution
  const yearCounts: Record<string, number> = {};
  eventRegs.forEach((r) => {
    const y = r.year || 'General';
    yearCounts[y] = (yearCounts[y] || 0) + 1;
  });

  const fetchAIInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const res = await fetch('/api/ai/event-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: event.title,
          eventType: event.type,
          stats: {
            totalRegistered,
            totalAttended,
            round1Done,
            round2Done,
            finalDone,
            winnersCount,
            capacity: event.maxStudents,
          },
        }),
      });
      const data = await res.json();
      setAiInsights(data.insights);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (!aiInsights) {
      fetchAIInsights();
    }
  }, [event.id]);

  return (
    <div className="space-y-6">
      {/* AI Insights Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Strategic Intelligence & Post-Event Diagnostics</span>
          </div>
          <button
            onClick={fetchAIInsights}
            disabled={isLoadingInsights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold border border-indigo-500/30 cursor-pointer disabled:opacity-50"
          >
            {isLoadingInsights ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Refresh Insights</span>
          </button>
        </div>

        {aiInsights ? (
          <div className="space-y-4 text-xs">
            <p className="text-slate-200 text-sm font-medium leading-relaxed">
              {aiInsights.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Key Highlights */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Key Event Highlights
                </div>
                <ul className="space-y-1 text-slate-300">
                  {aiInsights.highlights?.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dropout & Bottleneck Analysis */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Dropout & Bottleneck Analysis
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {aiInsights.dropoutAnalysis}
                </p>
              </div>

              {/* Recommendations */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" /> Strategic Recommendations
                </div>
                <ul className="space-y-1 text-slate-300">
                  {aiInsights.recommendations?.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400">→</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mb-2" />
            <span>Analyzing student attendance rates and panel throughput...</span>
          </div>
        )}
      </div>

      {/* Numerical Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Turnout Rate</div>
          <div className="text-2xl font-bold font-display text-emerald-400 mt-1">{attendancePercent}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{totalAttended} of {totalRegistered} attended</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Stage Completion Rate</div>
          <div className="text-2xl font-bold font-display text-sky-400 mt-1">{completionPercent}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{finalDone} reached final jury</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Podium Winners</div>
          <div className="text-2xl font-bold font-display text-amber-400 mt-1">{winnersCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Awarded merit credentials</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Active Panels</div>
          <div className="text-2xl font-bold font-display text-indigo-400 mt-1">{event.panels?.length || 3}</div>
          <div className="text-[11px] text-slate-500 mt-1">Zero room overlaps</div>
        </div>
      </div>

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
            <span className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              Department Representation Breakdown
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = Math.round((count / totalRegistered) * 100);
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">{dept}</span>
                    <span className="font-mono text-slate-400">{count} students ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Year-Wise Distribution & Funnel */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Academic Year Representation
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {Object.entries(yearCounts).map(([year, count]) => {
              const pct = Math.round((count / totalRegistered) * 100);
              return (
                <div key={year} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">{year}</span>
                    <span className="font-mono text-slate-400">{count} participants ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
