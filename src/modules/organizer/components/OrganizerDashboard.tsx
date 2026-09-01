import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Calendar,
  Sparkles,
  Users,
  Shuffle,
  UserCheck,
  Activity,
  Award,
  BarChart3,
  Plus,
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  Bot,
  MessageSquare,
  ArrowLeft,
  Eye,
  Trash2,
  Edit3,
} from 'lucide-react';
import { CreateEventModal } from './CreateEventModal';
import { RegistrationManager } from './RegistrationManager';
import { RandomAllocationEngine } from './RandomAllocationEngine';
import { VolunteerManager } from './VolunteerManager';
import { LiveMonitoring } from './LiveMonitoring';
import { CertificateSystem } from './CertificateSystem';
import { EventAnalytics } from './EventAnalytics';
import { AIAssistantChat } from './AIAssistantChat';

interface OrganizerDashboardProps {
  onOpenVerificationModal: (certId: string) => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  onOpenVerificationModal,
}) => {
  const {
    events,
    activeEventId,
    setActiveEventId,
    registrations,
    currentUser,
    deleteEvent,
    updateEventAgenda,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'REGISTRATIONS' | 'ALLOCATION' | 'VOLUNTEERS' | 'MONITORING' | 'CERTIFICATES' | 'ANALYTICS'
  >('OVERVIEW');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [isEditingAgenda, setIsEditingAgenda] = useState(false);
  const [agendaDraft, setAgendaDraft] = useState<any[]>([]);

  // Active event object
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const eventRegs = activeEvent ? registrations.filter((r) => r.eventId === activeEvent.id) : [];
  const presentCount = eventRegs.filter((r) => r.attendance?.attended).length;

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview & Agenda', icon: Layers },
    { id: 'REGISTRATIONS', label: `Registrations (${eventRegs.length})`, icon: Users },
    { id: 'ALLOCATION', label: 'Random Panel Allocation', icon: Shuffle },
    { id: 'VOLUNTEERS', label: 'Volunteer Rosters', icon: UserCheck },
    { id: 'MONITORING', label: 'Live Monitoring & Rounds', icon: Activity },
    { id: 'CERTIFICATES', label: 'Smart Certificate Engine', icon: Award },
    { id: 'ANALYTICS', label: 'Analytics & AI Insights', icon: BarChart3 },
  ];

  const publishedEvents = events.filter(event => event.status === 'PUBLISHED');

  const openEvent = (eventId: string) => {
    setActiveEventId(eventId);
    setActiveTab('OVERVIEW');
    setShowEventDetails(true);
    setIsEditingAgenda(false);
  };

  const handleDeleteEvent = (eventId: string, title: string) => {
    if (!window.confirm(`Delete the published event “${title}”? This cannot be undone.`)) return;
    deleteEvent(eventId);
    setShowEventDetails(false);
  };

  const beginAgendaEdit = () => {
    setAgendaDraft((activeEvent.agenda || []).map(item => ({ ...item })));
    setIsEditingAgenda(true);
  };

  const updateAgendaDraft = (id: string, field: string, value: string) => {
    setAgendaDraft(previous => previous.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  if (!activeEvent) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-200">No events found.</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 px-4 py-2 bg-indigo-600 rounded-xl text-white font-semibold text-xs"
        >
          Create First Event
        </button>
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onEventCreated={(e) => setActiveEventId(e.id)}
        />
      </div>
    );
  }

  if (!showEventDetails) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">Organiser Control Center</span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-display font-extrabold">Published events</h1>
              <p className="mt-1 text-sm text-slate-400">Select an event to manage its agenda, registrations, panels, volunteers, certificates, and analytics.</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all">
              <Plus className="w-4 h-4" /> Create New Event
            </button>
          </div>

          {publishedEvents.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {publishedEvents.map(event => {
                const registrationCount = registrations.filter(registration => registration.eventId === event.id).length;
                const eventEndDate = event.endDate || event.date;
                return (
                  <article key={event.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col gap-4 shadow-lg">
                    <div className="flex items-start justify-between gap-3"><span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-500/30 text-emerald-300">PUBLISHED</span><span className="text-xs text-slate-500">{event.type}</span></div>
                    <div><h2 className="font-display font-bold text-lg text-slate-100">{event.title}</h2><p className="mt-1 text-xs text-slate-400 line-clamp-2">{event.description}</p></div>
                    <div className="space-y-2 text-xs text-slate-400"><div className="flex gap-2"><Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />{event.date}{eventEndDate !== event.date ? ` – ${eventEndDate}` : ''} · {event.startTime} – {event.endTime}</div><div className="flex gap-2"><MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />{event.venue}</div><div className="flex gap-2"><Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{registrationCount} / {event.maxStudents} registered</div></div>
                    <div className="mt-auto flex gap-2 pt-2 border-t border-slate-800"><button onClick={() => openEvent(event.id)} className="flex-1 flex justify-center items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold"><Eye className="w-3.5 h-3.5" /> Open event</button><button onClick={() => handleDeleteEvent(event.id, event.title)} className="p-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-950/40" title="Delete published event"><Trash2 className="w-4 h-4" /></button></div>
                  </article>
                );
              })}
            </div>
          ) : <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400 text-sm">No published events yet. Create and publish your first event to see it here.</div>}
        </div>
        <CreateEventModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onEventCreated={(event) => { setActiveEventId(event.id); setShowCreateModal(false); setShowEventDetails(true); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 pb-16">
      {/* Top Banner & Quick Controls */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button onClick={() => setShowEventDetails(false)} className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200"><ArrowLeft className="w-3.5 h-3.5" /> All published events</button>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-bold text-[10px] uppercase tracking-wider">
                  Organiser Control Center
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-medium">{activeEvent.type}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-100 tracking-tight">
                {activeEvent.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {activeEvent.date}{activeEvent.endDate && activeEvent.endDate !== activeEvent.date ? ` – ${activeEvent.endDate}` : ''} ({activeEvent.startTime} - {activeEvent.endTime})
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {activeEvent.venue}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  {eventRegs.length} / {activeEvent.maxStudents} Students
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowChatDrawer(!showChatDrawer)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  showChatDrawer
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Bot className="w-4 h-4 text-indigo-300" />
                <span className="hidden sm:inline">AI Copilot</span>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Event</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 mt-6 overflow-x-auto no-scrollbar border-t border-slate-800/80 pt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Workspace Area (3 Cols or 4 Cols depending on Chat) */}
          <div className={`${showChatDrawer ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6`}>
            {/* OVERVIEW TAB */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                {/* Event Highlights & Coordinator Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">Convening Department</span>
                    <div className="font-bold text-slate-100 text-sm">{activeEvent.organizingDepartment}</div>
                    <div className="text-xs text-slate-400">Coordinator: {activeEvent.coordinatorName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{activeEvent.contactEmail}</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Capacity & Form Status</span>
                    <div className="font-bold text-slate-100 text-sm">
                      {eventRegs.length} Enrolled ({Math.round((eventRegs.length / activeEvent.maxStudents) * 100)}% Filled)
                    </div>
                    <div className="text-xs text-slate-400">
                      Form Fields: {activeEvent.registrationForm.length} Custom Attributes
                    </div>
                    <div className="text-[11px] text-emerald-400">Dynamic AI Schema Active</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Evaluation Setup</span>
                    <div className="font-bold text-slate-100 text-sm">
                      {activeEvent.panels?.length || 3} Jury Panels • {activeEvent.numRounds} Rounds
                    </div>
                    <div className="text-xs text-slate-400">
                      Allocations: {activeEvent.allocations?.length || 0} Slots Scheduled
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Roster: {activeEvent.volunteerAssignments?.length || 0} Volunteers
                    </div>
                  </div>
                </div>

                {/* AI Agenda Timeline */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-display font-bold text-slate-100">
                        AI-Generated Event Agenda & Timetable
                      </h3>
                      <p className="text-xs text-slate-400">
                        Calculated minute-by-minute schedule for participants, judges, and logistics leads.
                      </p>
                    </div>
                    <div className="flex items-center gap-2"><span className="px-2.5 py-1 rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">{activeEvent.agenda?.length || 0} Key Milestones</span>{!isEditingAgenda ? <button onClick={beginAgendaEdit} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-950"><Edit3 className="w-3 h-3" /> Edit agenda</button> : <><button onClick={() => { updateEventAgenda(activeEvent.id, agendaDraft); setIsEditingAgenda(false); }} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500">Save</button><button onClick={() => setIsEditingAgenda(false)} className="px-2.5 py-1 text-[11px] text-slate-400">Cancel</button></>}</div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3.5">Time Window</th>
                          <th className="p-3.5">Scheduled Activity</th>
                          <th className="p-3.5">Assigned Venue</th>
                          <th className="p-3.5">Lead / In-Charge</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {(activeEvent.agenda || []).map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-3.5 font-mono text-indigo-300 font-bold whitespace-nowrap">{isEditingAgenda ? <input value={agendaDraft[idx]?.time || ''} onChange={e => updateAgendaDraft(item.id, 'time', e.target.value)} className="w-36 bg-transparent border-b border-indigo-500/40 outline-none" /> : item.time}</td>
                            <td className="p-3.5 font-semibold text-slate-200">{isEditingAgenda ? <input value={agendaDraft[idx]?.activity || ''} onChange={e => updateAgendaDraft(item.id, 'activity', e.target.value)} className="w-full bg-transparent border-b border-slate-600 outline-none" /> : item.activity}</td>
                            <td className="p-3.5 text-slate-400">{isEditingAgenda ? <input value={agendaDraft[idx]?.venue || ''} onChange={e => updateAgendaDraft(item.id, 'venue', e.target.value)} className="w-full bg-transparent border-b border-slate-600 outline-none" /> : item.venue}</td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                                {isEditingAgenda ? <input value={agendaDraft[idx]?.responsiblePerson || ''} onChange={e => updateAgendaDraft(item.id, 'responsiblePerson', e.target.value)} className="w-36 bg-transparent outline-none" /> : item.responsiblePerson}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Event Description & Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Event Rules & Conduct
                    </h4>
                    <p className="text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                      {activeEvent.rules}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Eligibility & Evaluation Criteria
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {activeEvent.eligibilityCriteria}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* REGISTRATIONS TAB */}
            {activeTab === 'REGISTRATIONS' && <RegistrationManager event={activeEvent} />}

            {/* ALLOCATION TAB */}
            {activeTab === 'ALLOCATION' && <RandomAllocationEngine event={activeEvent} />}

            {/* VOLUNTEERS TAB */}
            {activeTab === 'VOLUNTEERS' && <VolunteerManager event={activeEvent} />}

            {/* MONITORING TAB */}
            {activeTab === 'MONITORING' && <LiveMonitoring event={activeEvent} />}

            {/* CERTIFICATES TAB */}
            {activeTab === 'CERTIFICATES' && (
              <CertificateSystem
                event={activeEvent}
                onOpenVerificationModal={onOpenVerificationModal}
              />
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'ANALYTICS' && <EventAnalytics event={activeEvent} />}
          </div>

          {/* Right Sidebar: AI Assistant Chat (when toggled) */}
          {showChatDrawer && (
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <AIAssistantChat event={activeEvent} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={(newEvent) => {
          setActiveEventId(newEvent.id);
        }}
      />
    </div>
  );
};

