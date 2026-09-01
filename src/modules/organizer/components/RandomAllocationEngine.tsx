import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { EventItem, PanelAllocation, PanelMember } from '../../../types';
import {
  Shuffle,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Loader2,
  Send,
  Edit2,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RandomAllocationEngineProps {
  event: EventItem;
}

export const RandomAllocationEngine: React.FC<RandomAllocationEngineProps> = ({ event }) => {
  const { registrations, updateEventAllocations, updateEventPanels } = useApp();

  const [panels, setPanels] = useState<PanelMember[]>(
    event.panels?.length > 0
      ? event.panels
      : [
          { id: 'p1', name: 'Dr. Ramesh Kumar (Track Lead)', email: 'ramesh@college.edu', department: 'Computer Science', assignedRoom: 'Lab 101', expertise: 'Cloud & AI' },
          { id: 'p2', name: 'Prof. Shalini V (Industry Lead)', email: 'shalini@college.edu', department: 'Information Tech', assignedRoom: 'Room 204', expertise: 'Web & Systems' },
          { id: 'p3', name: 'Mr. David Chen (Architecture Lead)', email: 'david@college.edu', department: 'AI & Data Science', assignedRoom: 'Seminar Hall B', expertise: 'Security & Scale' },
        ]
  );

  const [availableRooms, setAvailableRooms] = useState<string[]>(['Lab 101', 'Room 204', 'Seminar Hall B', 'Innovation Hub']);
  const [presentationDuration, setPresentationDuration] = useState<number>(10);
  const [reviewDuration, setReviewDuration] = useState<number>(5);
  const [breakDuration, setBreakDuration] = useState<number>(15);
  const [startTime, setStartTime] = useState<string>(event.startTime || '09:30 AM');
  const [endTime, setEndTime] = useState<string>(event.endTime || '04:30 PM');
  const [numRounds, setNumRounds] = useState<number>(event.numRounds || 2);

  const [allocations, setAllocations] = useState<PanelAllocation[]>(event.allocations || []);
  const [isAllocating, setIsAllocating] = useState<boolean>(false);
  const [published, setPublished] = useState<boolean>(event.allocations?.length > 0);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PanelAllocation>>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [candidateFilter, setCandidateFilter] = useState<'PRESENT_ONLY' | 'ALL_REGISTERED'>('PRESENT_ONLY');

  // Extract distinct teams from registrations (prioritizing active present teams from attendance)
  const eventRegs = registrations.filter((r) => r.eventId === event.id);
  const presentRegs = eventRegs.filter((r) => r.attendance?.attended && r.teamEligibility !== 'DISQUALIFIED_ABSENT');
  const absentRegs = eventRegs.filter((r) => !r.attendance?.attended || r.teamEligibility === 'DISQUALIFIED_ABSENT');

  const targetRegs = candidateFilter === 'PRESENT_ONLY' && presentRegs.length > 0 
    ? presentRegs 
    : (candidateFilter === 'PRESENT_ONLY' ? [] : eventRegs);

  const targetTeams = targetRegs.map((r) => ({
    id: r.id,
    name: r.teamName || r.studentName,
    leadName: r.studentName,
    rollNo: r.rollNumber,
    attendanceStatus: r.attendance?.status || (r.attendance?.attended ? 'PRESENT' : 'ABSENT'),
  }));

  const fallbackTeams = [
    { id: 't1', name: 'NeuralHack', leadName: 'Alex Morgan', rollNo: 'TEAM-1' },
    { id: 't2', name: 'AlgoTitans', leadName: 'Priya Sharma', rollNo: 'TEAM-2' },
    { id: 't3', name: 'QuantumCrafters', leadName: 'Karthik Raja', rollNo: 'TEAM-3' },
    { id: 't4', name: 'DevDynasty', leadName: 'Rahul Verma', rollNo: 'TEAM-4' },
    { id: 't5', name: 'CipherZero', leadName: 'Sneha Patel', rollNo: 'TEAM-5' },
    { id: 't6', name: 'ApexVision', leadName: 'Devika Nair', rollNo: 'TEAM-6' },
  ];

  const totalTeams = targetTeams.length > 0 ? targetTeams : (eventRegs.length === 0 ? fallbackTeams : targetTeams);

  // AI & Random Matrix Engine
  const handleRunAllocation = async () => {
    if (candidateFilter === 'PRESENT_ONLY' && presentRegs.length === 0 && eventRegs.length > 0) {
      alert('No participants have been marked PRESENT yet! Mark attendance via the Volunteer Dashboard or switch to "All Registered".');
      return;
    }

    setIsAllocating(true);
    try {
      const res = await fetch('/api/ai/allocate-panels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          panels,
          teams: totalTeams.length > 0 ? totalTeams : fallbackTeams,
          availableRooms,
          presentationDuration,
          reviewDuration,
          breakDuration,
          startTime,
          endTime,
          numRounds,
        }),
      });

      const data = await res.json();
      if (data.allocations) {
        setAllocations(data.allocations);
        setPublished(false);
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
      }
    } catch (err) {
      console.error('Allocation error:', err);
    } finally {
      setIsAllocating(false);
    }
  };

  const handlePublishSchedule = () => {
    updateEventAllocations(event.id, allocations);
    updateEventPanels(event.id, panels);
    setPublished(true);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
  };

  // Inline editing
  const startEdit = (slot: PanelAllocation) => {
    setEditingSlotId(slot.id);
    setEditForm(slot);
  };

  const saveEdit = () => {
    if (!editingSlotId) return;
    setAllocations((prev) =>
      prev.map((a) => (a.id === editingSlotId ? ({ ...a, ...editForm } as PanelAllocation) : a))
    );
    setEditingSlotId(null);
  };

  // Add a new jury panel member
  const handleAddPanel = () => {
    const newP: PanelMember = {
      id: `p_${Date.now()}`,
      name: 'Dr. New Jury Member',
      email: 'panel.lead@college.edu',
      department: 'Computer Science',
      assignedRoom: availableRooms[panels.length % availableRooms.length] || 'Lab 101',
      expertise: 'General Technology',
    };
    setPanels([...panels, newP]);
  };

  const handleRemovePanel = (id: string) => {
    setPanels(panels.filter((p) => p.id !== id));
  };

  const filteredAllocations = allocations.filter((a) => {
    return (
      a.teamName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.panelName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.room.toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Overview & Action Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shuffle className="w-4 h-4" />
            <span>Random & Conflict-Free Panel Allocation Engine</span>
          </div>
          <h2 className="text-xl font-display font-bold text-slate-100">
            Intelligent Jury Matrix & Schedule Allocator
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Automatically maps teams across {panels.length} jury panels, guarantees balanced evaluation loads, eliminates room collisions, and sequences presentations across rounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAllocation}
            disabled={isAllocating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isAllocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{allocations.length > 0 ? 'Regenerate Matrix' : 'Generate Allocation'}</span>
          </button>

          {allocations.length > 0 && !published && (
            <button
              onClick={handlePublishSchedule}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publish to Students</span>
            </button>
          )}

          {published && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" /> Published
            </span>
          )}
        </div>
      </div>

      {/* Engine Parameters & Panel Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Parameters Config */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Allocation Engine Parameters
            </span>
            <span className="text-xs text-slate-500">
              {totalTeams.length} Registered Teams Loaded
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Presentation (mins)</label>
              <input
                type="number"
                value={presentationDuration}
                onChange={(e) => setPresentationDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Q&A Review (mins)</label>
              <input
                type="number"
                value={reviewDuration}
                onChange={(e) => setReviewDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Break (mins)</label>
              <input
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Rounds to Allocate</label>
              <input
                type="number"
                value={numRounds}
                onChange={(e) => setNumRounds(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Session Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:30 AM"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Available Rooms (comma-separated)</label>
              <input
                type="text"
                value={availableRooms.join(', ')}
                onChange={(e) => setAvailableRooms(e.target.value.split(',').map((s) => s.trim()))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
          </div>

          {/* Candidate Allocation Pool Selector */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Candidate Allocation Pool
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {candidateFilter === 'PRESENT_ONLY' ? `${presentRegs.length} Verified Present` : `${eventRegs.length} Total Submissions`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setCandidateFilter('PRESENT_ONLY')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  candidateFilter === 'PRESENT_ONLY'
                    ? 'bg-indigo-600/15 border-indigo-500 text-slate-100 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Verified Present Only</span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    {presentRegs.length} Teams
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  ✓ Automatically filters out {absentRegs.length} absent members so juries evaluate only real attendees.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCandidateFilter('ALL_REGISTERED')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  candidateFilter === 'ALL_REGISTERED'
                    ? 'bg-indigo-600/15 border-indigo-500 text-slate-100 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>All Registered</span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-700 text-slate-200 font-bold">
                    {eventRegs.length} Teams
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Includes all registrations (for pre-event mock scheduling before check-in).
                </div>
              </button>
            </div>

            {candidateFilter === 'PRESENT_ONLY' && presentRegs.length === 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  No participants are marked <strong>PRESENT</strong> yet. Once volunteers mark attendance at the desk, their squads will appear here.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Panel Jury Setup */}
        <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Active Panels ({panels.length})
            </span>
            <button
              onClick={handleAddPanel}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {panels.map((p, idx) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{p.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="text-indigo-400">{p.assignedRoom}</span>
                    <span>• {p.expertise}</span>
                  </div>
                </div>
                {panels.length > 1 && (
                  <button
                    onClick={() => handleRemovePanel(p.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Allocation Matrix Table */}
      {allocations.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100">
                Generated Allocation Matrix ({allocations.length} Slots)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                ✓ 100% Conflict-Free
              </span>
            </div>

            <div className="relative max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by team, panel, room..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Round</th>
                  <th className="p-3.5">Assigned Team</th>
                  <th className="p-3.5">Panel Jury</th>
                  <th className="p-3.5">Room</th>
                  <th className="p-3.5">Time Window</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAllocations.map((slot) => {
                  const isEditing = editingSlotId === slot.id;
                  return (
                    <tr key={slot.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5 font-bold text-indigo-400">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.roundNumber || ''}
                            onChange={(e) => setEditForm({ ...editForm, roundNumber: Number(e.target.value) })}
                            className="w-20 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                          />
                        ) : (
                          slot.roundNumber
                        )}
                      </td>

                      <td className="p-3.5 font-semibold text-slate-200">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.teamName || ''}
                            onChange={(e) => setEditForm({ ...editForm, teamName: e.target.value })}
                            className="w-32 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                          />
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/30 text-indigo-300">
                            {slot.teamName}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-300">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.panelName || ''}
                            onChange={(e) => setEditForm({ ...editForm, panelName: e.target.value })}
                            className="w-40 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                          />
                        ) : (
                          slot.panelName
                        )}
                      </td>

                      <td className="p-3.5 text-slate-300">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.room || ''}
                            onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                            className="w-28 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                          />
                        ) : (
                          <span className="flex items-center gap-1 font-mono text-[11px] text-amber-300">
                            <MapPin className="w-3 h-3 text-slate-500" /> {slot.room}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono text-indigo-300">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.timeSlot || ''}
                            onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                            className="w-36 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100"
                          />
                        ) : (
                          slot.timeSlot
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {slot.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        {isEditing ? (
                          <button
                            onClick={saveEdit}
                            className="p-1 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 ml-auto"
                          >
                            <Check className="w-3 h-3" /> Save
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(slot)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                            title="Edit Allocation Slot"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
