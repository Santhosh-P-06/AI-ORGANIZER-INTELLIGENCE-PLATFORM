import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EventItem, EventType, FormField, AgendaItem } from '../../types';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  Layers,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  Loader2,
  HelpCircle,
  Award,
} from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: EventItem) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const { createEvent, currentUser } = useApp();
  const [step, setStep] = useState<'DETAILS' | 'FORM_GEN' | 'AGENDA_GEN'>('DETAILS');

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('Hackathon');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-09-20');
  const [endDate, setEndDate] = useState('2026-09-20');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [venue, setVenue] = useState('Main Campus Auditorium & Labs');
  const [maxStudents, setMaxStudents] = useState(100);
  const [maxTeams, setMaxTeams] = useState(25);
  const [teamSizeMin, setTeamSizeMin] = useState(1);
  const [teamSizeMax, setTeamSizeMax] = useState(4);
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-09-18');
  const [coordinatorName, setCoordinatorName] = useState(currentUser?.name || 'Prof. Rajesh Sharma');
  const [organizingDepartment, setOrganizingDepartment] = useState(currentUser?.department || 'Computer Science & Engineering');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || 'events@college.edu');
  const [contactNumber, setContactNumber] = useState('+91 98450 12345');
  const [numRounds, setNumRounds] = useState(2);
  const [numPanels, setNumPanels] = useState(3);
  const [rules, setRules] = useState('1. Original work only.\n2. College ID mandatory at check-in.\n3. 10-min presentation + 5-min Q&A.');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('Open to all registered college students.');

  // AI Generated Schemas
  const [generatedFields, setGeneratedFields] = useState<FormField[]>([]);
  const [generatedAgenda, setGeneratedAgenda] = useState<AgendaItem[]>([]);
  const [isGeneratingForm, setIsGeneratingForm] = useState(false);
  const [isGeneratingAgenda, setIsGeneratingAgenda] = useState(false);

  // Field editing state
  const [editingField, setEditingField] = useState<FormField | null>(null);

  if (!isOpen) return null;

  const eventTypes: EventType[] = [
    'Hackathon',
    'Paper Presentation',
    'Coding Contest',
    'Project Expo',
    'Robotics Challenge',
    'Cultural Fest',
    'Technical Quiz',
    'Workshop & Bootcamp',
  ];

  // AI Generation Handlers
  const handleGenerateAIForm = async () => {
    setIsGeneratingForm(true);
    try {
      const res = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: title,
          eventType: type,
          description,
          rules,
          eligibility: eligibilityCriteria,
          teamSizeMax,
        }),
      });
      const data = await res.json();
      if (data.fields) {
        setGeneratedFields(data.fields);
      }
    } catch (err) {
      console.error('Failed to generate form with AI:', err);
    } finally {
      setIsGeneratingForm(false);
    }
  };

  const handleGenerateAIAgenda = async () => {
    setIsGeneratingAgenda(true);
    try {
      const res = await fetch('/api/ai/generate-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: title,
          eventType: type,
          startTime,
          endTime,
          venue,
          numRounds,
          numPanels,
          maxTeams,
          maxStudents,
        }),
      });
      const data = await res.json();
      if (data.agenda) {
        setGeneratedAgenda(data.agenda);
      }
    } catch (err) {
      console.error('Failed to generate agenda with AI:', err);
    } finally {
      setIsGeneratingAgenda(false);
    }
  };

  const handleNextFromDetails = async () => {
    if (!title.trim()) {
      alert('Please enter an Event Name');
      return;
    }
    setStep('FORM_GEN');
    if (generatedFields.length === 0) {
      handleGenerateAIForm();
    }
  };

  const handleNextFromForm = () => {
    setStep('AGENDA_GEN');
    if (generatedAgenda.length === 0) {
      handleGenerateAIAgenda();
    }
  };

  const handleFinalPublish = () => {
    const newEvent = createEvent({
      title,
      type,
      description,
      date,
      endDate,
      startTime,
      endTime,
      venue,
      maxStudents,
      maxTeams,
      teamSizeMin,
      teamSizeMax,
      registrationDeadline,
      coordinatorName,
      organizingDepartment,
      contactEmail,
      contactNumber,
      numRounds,
      numPanels,
      rules,
      eligibilityCriteria,
      status: 'PUBLISHED',
      registrationForm: generatedFields,
      agenda: generatedAgenda,
    });

    onEventCreated(newEvent);
    onClose();
  };

  // Form Field Modifiers
  const addCustomField = () => {
    const newField: FormField = {
      id: `f_${Date.now()}`,
      label: 'New Custom Field',
      type: 'text',
      placeholder: 'Enter response...',
      required: false,
      helpText: '',
    };
    setGeneratedFields(prev => [...prev, newField]);
  };

  const removeField = (id: string) => {
    setGeneratedFields(prev => prev.filter(f => f.id !== id));
  };

  const toggleFieldRequired = (id: string) => {
    setGeneratedFields(prev => prev.map(f => f.id === id ? { ...f, required: !f.required } : f));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= generatedFields.length) return;
    const newFields = [...generatedFields];
    const temp = newFields[index];
    newFields[index] = newFields[targetIdx];
    newFields[targetIdx] = temp;
    setGeneratedFields(newFields);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setGeneratedFields(prev => prev.map(field => field.id === id ? { ...field, ...updates } : field));
  };

  const updateAgendaItem = (id: string, updates: Partial<AgendaItem>) => {
    setGeneratedAgenda(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const addAgendaItem = () => {
    setGeneratedAgenda(prev => [...prev, {
      id: `ag_custom_${Date.now()}`,
      time: '09:00 AM - 10:00 AM',
      activity: 'New agenda activity',
      venue,
      responsiblePerson: coordinatorName,
      status: 'PENDING',
    }]);
  };

  const removeAgendaItem = (id: string) => {
    setGeneratedAgenda(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-100">
                Create Event with AI Intelligence
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${step === 'DETAILS' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  1. Event Details
                </span>
                <span className="text-slate-600 text-xs">→</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${step === 'FORM_GEN' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  2. AI Registration Form
                </span>
                <span className="text-slate-600 text-xs">→</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${step === 'AGENDA_GEN' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  3. AI Agenda Engine
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Basic Event Information */}
          {step === 'DETAILS' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AI HackSprint 2026: 24-Hour Innovation Marathon"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Event Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {eventTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Main Venue / Location</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Auditorium Alpha & Labs 1-4"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Event Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Comprehensive description of the event theme, objectives, and mentorship opportunities..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                    <input
                      type="date"
                      min={date}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="05:00 PM"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Student Capacity</label>
                  <input
                    type="number"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Max Teams</label>
                    <input
                      type="number"
                      value={maxTeams}
                      onChange={(e) => setMaxTeams(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Team Size (Max)</label>
                    <input
                      type="number"
                      value={teamSizeMax}
                      onChange={(e) => setTeamSizeMax(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Rounds</label>
                  <input
                    type="number"
                    value={numRounds}
                    onChange={(e) => setNumRounds(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Evaluation Panels</label>
                  <input
                    type="number"
                    value={numPanels}
                    onChange={(e) => setNumPanels(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Event Coordinator</label>
                  <input
                    type="text"
                    value={coordinatorName}
                    onChange={(e) => setCoordinatorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Organising Department</label>
                  <input
                    type="text"
                    value={organizingDepartment}
                    onChange={(e) => setOrganizingDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rules & Guidelines</label>
                  <textarea
                    rows={2}
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono text-[11px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Eligibility Criteria</label>
                  <input
                    type="text"
                    value={eligibilityCriteria}
                    onChange={(e) => setEligibilityCriteria(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AI Registration Form Generator & Customizer */}
          {step === 'FORM_GEN' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>AI-Generated Dynamic Registration Schema</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    The AI analyzed your event type ({type}) and team size ({teamSizeMax}) to construct tailored form fields.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAIForm}
                  disabled={isGeneratingForm}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md disabled:opacity-50"
                >
                  {isGeneratingForm ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Regenerate with AI</span>
                </button>
              </div>

              {/* Field List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                  <span>Registration Fields ({generatedFields.length})</span>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Field</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-800 rounded-xl bg-slate-950 border border-slate-800">
                  {generatedFields.map((field, idx) => (
                    <div key={field.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="font-mono text-slate-500 text-[10px] w-4">{idx + 1}.</span>
                        <div className="truncate">
                          <div className="font-semibold text-slate-200 flex items-center gap-2">
                            <input
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              aria-label={`Field ${idx + 1} name`}
                              className="min-w-0 flex-1 bg-transparent border-b border-transparent hover:border-slate-600 focus:border-indigo-500 outline-none"
                            />
                            {field.required ? (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30">
                                Required
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                Optional
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="uppercase text-[10px] text-indigo-400">{field.type}</span>
                            {field.placeholder && <span>• "{field.placeholder}"</span>}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleFieldRequired(field.id)}
                          className={`px-2 py-1 rounded text-[11px] font-medium border ${field.required ? 'bg-rose-950/40 text-rose-300 border-rose-500/30' : 'bg-slate-900 text-slate-400 border-slate-700'}`}
                        >
                          {field.required ? 'Req' : 'Opt'}
                        </button>
                        <button
                          type="button"
                          onClick={() => moveField(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-20"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveField(idx, 'down')}
                          disabled={idx === generatedFields.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-20"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AI Agenda Generation Engine */}
          {step === 'AGENDA_GEN' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>AI Master Event Agenda Timeline</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Calculated minute schedule accounting for {numPanels} panels, {numRounds} rounds, breaks, and jury deliberation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAIAgenda}
                  disabled={isGeneratingAgenda}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md disabled:opacity-50"
                >
                  {isGeneratingAgenda ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Regenerate Agenda</span>
                </button>
              </div>

              {/* Agenda Table */}
              <div className="flex justify-end">
                <button type="button" onClick={addAgendaItem} className="flex items-center gap-1 text-xs font-semibold text-purple-300 hover:text-purple-200">
                  <Plus className="w-3.5 h-3.5" /> Add agenda item
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Activity</th>
                      <th className="p-3">Venue</th>
                      <th className="p-3">Responsible</th>
                      <th className="p-3 w-10"><span className="sr-only">Remove</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {generatedAgenda.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-900/50">
                        <td className="p-3"><input value={item.time} onChange={(e) => updateAgendaItem(item.id, { time: e.target.value })} className="w-36 bg-transparent text-indigo-300 font-mono outline-none border-b border-transparent focus:border-indigo-500" /></td>
                        <td className="p-3"><input value={item.activity} onChange={(e) => updateAgendaItem(item.id, { activity: e.target.value })} className="w-full min-w-40 bg-transparent font-semibold text-slate-200 outline-none border-b border-transparent focus:border-indigo-500" /></td>
                        <td className="p-3"><input value={item.venue} onChange={(e) => updateAgendaItem(item.id, { venue: e.target.value })} className="w-full min-w-32 bg-transparent text-slate-400 outline-none border-b border-transparent focus:border-indigo-500" /></td>
                        <td className="p-3 text-slate-400">
                          <input value={item.responsiblePerson} onChange={(e) => updateAgendaItem(item.id, { responsiblePerson: e.target.value })} className="w-full min-w-32 bg-slate-900 border border-slate-800 rounded-md px-2 py-1 text-[11px] text-slate-300 outline-none focus:border-indigo-500" />
                        </td>
                        <td className="p-3"><button type="button" onClick={() => removeAgendaItem(item.id)} className="p-1 text-rose-400 hover:bg-rose-950/40 rounded" title="Remove agenda item"><Trash2 className="w-3.5 h-3.5" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          {step !== 'DETAILS' ? (
            <button
              type="button"
              onClick={() => setStep(step === 'AGENDA_GEN' ? 'FORM_GEN' : 'DETAILS')}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 border border-slate-700"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>

            {step === 'DETAILS' && (
              <button
                type="button"
                onClick={handleNextFromDetails}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg flex items-center gap-1.5"
              >
                <span>Generate with AI</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 'FORM_GEN' && (
              <button
                type="button"
                onClick={handleNextFromForm}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg flex items-center gap-1.5"
              >
                <span>Next: AI Agenda</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 'AGENDA_GEN' && (
              <button
                type="button"
                onClick={handleFinalPublish}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Event & Form</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
