import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { EventItem, EventType, FormField, AgendaItem, IntelligenceReport } from '../../../types';
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
  AlertTriangle,
  Award,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Bot,
  Zap,
  Coffee,
  CheckCircle,
  HelpCircle,
  BarChart2,
  ListOrdered,
  Gauge,
  Laptop,
  Music,
  Code,
  FolderKanban,
  FileSpreadsheet,
  Activity,
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [step, setStep] = useState<'COMMON_DETAILS' | 'EVENT_SPECIFIC' | 'FORM_GEN' | 'AGENDA_GEN'>('COMMON_DETAILS');

  // STEP 1 — Common Questions State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('Hackathon');
  const [description, setDescription] = useState('');
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [date, setDate] = useState('2026-09-20');
  const [endDate, setEndDate] = useState('2026-09-20');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('05:00 PM');
  const [expectedParticipants, setExpectedParticipants] = useState(100);
  const [venue, setVenue] = useState('Campus Main Auditorium & Computing Center');
  const [numOrganizers, setNumOrganizers] = useState(4);
  const [numVolunteers, setNumVolunteers] = useState(12);
  const [fixedActivities, setFixedActivities] = useState('Inauguration at 09:30 AM with Chief Guest, Keynote at 10:00 AM');
  const [requiredBreaks, setRequiredBreaks] = useState('Lunch Break (01:00 PM - 02:00 PM), Afternoon Tea (04:00 PM - 04:20 PM)');
  const [specialConstraints, setSpecialConstraints] = useState('Strict code freeze before jury review; 15-minute stage changeover buffer between acts.');

  // STEP 2 — Event-Specific Parameter Blocks
  const [eventConfig, setEventConfig] = useState<Record<string, any>>({
    // Hackathon defaults
    numTeams: 24,
    teamSizeMin: 2,
    teamSizeMax: 4,
    hackathonDurationHours: 24,
    eventMode: 'Offline / On-Campus',
    problemReleaseTime: '09:45 AM',
    numRounds: 2,
    hasIdeaRound: true,
    hasCodingRound: true,
    hasFinalPresentation: true,
    mentorCount: 8,
    mentoringMode: 'Parallel (Mentors visit individual team pods)',
    numJudges: 6,
    numPanels: 3,
    judgeExpertise: 'AI & Data Engineering, System Scalability, Product Design',
    evalDurationPerTeamMins: 10,
    qaDurationMins: 5,
    requiredLabs: 'Innovation Computing Labs 1-4, High-speed LAN, 2x 4S LiPo charging pods',
    submissionDeadline: '12:00 PM (Day 2)',
    prizeDistributionTime: '04:00 PM (Day 2)',
    certificateRequirements: 'Participation Certificate with QR for all active present teams; Merit certificates for Top 3',

    // Paper Presentation defaults
    paperPresentationMode: 'Team (2-3 Members)',
    numPapers: 30,
    paperPresentationMins: 8,
    paperQaMins: 4,
    numParallelTracks: 3,
    paperScreeningRequired: true,
    paperSubmissionDeadline: '2026-09-15',
    paperJudgingCriteria: 'Originality, Methodology, Practical Evaluation, Defense Quality',

    // Coding Contest defaults
    codingFormat: 'Individual Contestant',
    contestDurationMins: 180,
    codingRounds: 2,
    codingPlatform: 'HackerRank / In-House Secure IDE',
    numProblems: 6,
    difficultyDistribution: '2 Easy, 3 Medium, 1 Hard',
    hasPracticeTrial: true,
    invigilatorCount: 6,
    techSupportStaffCount: 3,

    // Project Expo defaults
    numProjects: 32,
    stallCount: 32,
    exhibitionAreas: 'Central Engineering Pavilion (Halls A & B)',
    stallEvalMins: 10,
    hasPreliminaryScreening: true,
    stallSetupMins: 60,
    powerRequirements: '230V 16A per 4 stalls, High-speed Wi-Fi SSID',
    canEvaluateParallel: true,

    // Robotics Challenge defaults
    challengeRounds: 2,
    practiceTimeMins: 45,
    robotTestingMins: 30,
    testingArenasCount: 2,
    arenaSafetyRequirements: 'Polycarbonate protective walls, E-stop switches, LiPo safety boxes',
    repairBufferMins: 20,

    // Cultural Fest defaults
    numPerformances: 18,
    performanceGenres: 'Classical & Western Singing, Synchronized Dance, Theatrical Drama, Fashion Runway, Battle of Bands',
    durationPerPerfMins: 8,
    stageChangeoverMins: 4,
    anchorsCount: 4,
    soundLightingRequirements: 'Digital soundboard, 6 Wireless Mics, Moving Head Stage Lights, Smoke Haze',
    chiefGuestAvailability: '04:00 PM - 05:30 PM (Valedictory)',

    // Technical Quiz defaults
    quizFormat: 'Team of 2 (Duo)',
    quizRoundsCount: 4,
    quizRoundNames: 'Round 1: Written Prelims, Round 2: Tech Audio-Visual, Round 3: Infinite Bounce, Round 4: Rapid Buzzer',
    questionsPerRound: '30 Prelims, 10 Stage per round',
    hasTieBreaker: true,
    hasAudienceRound: true,
    moderatorCount: 2,

    // Workshop & Bootcamp defaults
    workshopTopic: 'Building Full-Stack GenAI & Agentic Workflows with Next.js & Gemini',
    targetAudience: '2nd to 4th Year Engineering Students & Researchers',
    skillLevel: 'Beginner to Intermediate',
    instructorCount: 2,
    speakerAvailability: 'Full Day (09:30 AM - 04:30 PM)',
    sessionsCount: 3,
    handsOnLabRequired: true,
    prerequisiteTools: 'VS Code, Node.js v20+, Git, Active Google Cloud / Gemini API key',
    hasCapstoneQuiz: true,
  });

  const updateConfig = (field: string, val: any) => {
    setEventConfig((prev) => ({ ...prev, [field]: val }));
  };

  // Live AI Feasibility & Conflict Calculation
  const feasibilityCheck = useMemo(() => {
    const panels = Number(eventConfig.numPanels || eventConfig.numParallelTracks || 3);
    const teams = Number(eventConfig.numTeams || eventConfig.numPapers || eventConfig.numProjects || 24);
    const evalMins = Number(eventConfig.evalDurationPerTeamMins || eventConfig.paperPresentationMins || eventConfig.stallEvalMins || 10);
    const qaMins = Number(eventConfig.qaDurationMins || eventConfig.paperQaMins || 4);
    const totalSlotMins = evalMins + qaMins;

    const teamsPerPanel = Math.ceil(teams / Math.max(1, panels));
    const totalRequiredEvalMinutes = teamsPerPanel * totalSlotMins;

    // Time window calculation
    const isOverloaded = totalRequiredEvalMinutes > 240; // > 4 hours evaluation in single shift

    return {
      teamsPerPanel,
      totalSlotMins,
      totalRequiredEvalMinutes,
      isOverloaded,
      recommendedPanels: Math.ceil(teams / 6),
      participantRatio: Math.round(expectedParticipants / Math.max(1, numVolunteers)),
    };
  }, [eventConfig, expectedParticipants, numVolunteers]);

  // AI Generated Schemas
  const [generatedFields, setGeneratedFields] = useState<FormField[]>([]);
  const [generatedAgenda, setGeneratedAgenda] = useState<AgendaItem[]>([]);
  const [intelligenceReport, setIntelligenceReport] = useState<IntelligenceReport | null>(null);
  const [isGeneratingForm, setIsGeneratingForm] = useState(false);
  const [isGeneratingAgenda, setIsGeneratingAgenda] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<string>('ALL');

  // Field editing state
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [editingAgendaItem, setEditingAgendaItem] = useState<AgendaItem | null>(null);

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
          teamSizeMax: eventConfig.teamSizeMax || 4,
          eventConfig,
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
          isMultiDay,
          startDate: date,
          endDate: isMultiDay ? endDate : date,
          numParticipants: expectedParticipants,
          numTeams: eventConfig.numTeams || eventConfig.numPapers || eventConfig.numProjects || 24,
          numPanels: eventConfig.numPanels || eventConfig.numParallelTracks || 3,
          numOrganizers,
          numVolunteers,
          fixedActivities,
          requiredBreaks,
          specialConstraints,
          eventConfig,
        }),
      });
      const data = await res.json();
      if (data.agenda) {
        setGeneratedAgenda(data.agenda);
        if (data.intelligenceReport) {
          setIntelligenceReport(data.intelligenceReport);
        }
      }
    } catch (err) {
      console.error('Failed to generate agenda with AI:', err);
    } finally {
      setIsGeneratingAgenda(false);
    }
  };

  const handleNextFromCommon = () => {
    if (!title.trim()) {
      alert('Please enter an Event Name.');
      return;
    }
    setStep('EVENT_SPECIFIC');
  };

  const handleNextFromSpecific = async () => {
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

  // Final Event Publication
  const handleFinalPublish = () => {
    const newEvent = createEvent({
      title: title.trim(),
      type,
      description: description.trim() || `Inter-collegiate ${type} organized by Department of Computer Science.`,
      date,
      endDate: isMultiDay ? endDate : date,
      startTime,
      endTime,
      venue: venue.trim(),
      maxStudents: expectedParticipants,
      maxTeams: Number(eventConfig.numTeams || eventConfig.numProjects || 25),
      teamSizeMin: Number(eventConfig.teamSizeMin || 1),
      teamSizeMax: Number(eventConfig.teamSizeMax || 4),
      registrationDeadline: date,
      coordinatorName: currentUser?.name || 'Prof. Rajesh Sharma',
      organizingDepartment: currentUser?.department || 'Computer Science & Engineering',
      contactEmail: currentUser?.email || 'events@college.edu',
      contactNumber: currentUser?.phone || '+91 98450 12345',
      numRounds: Number(eventConfig.numRounds || eventConfig.challengeRounds || 2),
      numPanels: Number(eventConfig.numPanels || eventConfig.numParallelTracks || 3),
      rules: specialConstraints || 'Standard code of conduct and institutional ID check applies.',
      eligibilityCriteria: `Open to all registered undergraduate and postgraduate college students.`,
      status: 'PUBLISHED',
      registrationForm: generatedFields.length > 0 ? generatedFields : [
        { id: 'f_name', label: 'Full Student Name', type: 'text', placeholder: 'e.g. Alex Morgan', required: true },
        { id: 'f_roll', label: 'Roll Number', type: 'text', placeholder: 'e.g. 21CS084', required: true },
        { id: 'f_email', label: 'College Email ID', type: 'email', placeholder: 'alex@college.edu', required: true },
        { id: 'f_dept', label: 'Department', type: 'select', required: true, options: ['Computer Science', 'Information Tech', 'AI & DS', 'ECE', 'Mechanical'] },
      ],
      agenda: generatedAgenda,
      intelligenceReport: intelligenceReport || undefined,
      eventConfig,
      isMultiDay,
      panels: Array.from({ length: Number(eventConfig.numPanels || eventConfig.numParallelTracks || 3) }, (_, i) => ({
        id: `pnl_${i + 1}`,
        name: `Panel ${i + 1} (${type} Jury)`,
        email: `panel${i + 1}@college.edu`,
        department: 'Engineering & Computing',
        assignedRoom: `Room ${101 + i}`,
        expertise: eventConfig.judgeExpertise || 'Technical & Innovation Evaluation',
      })),
    });

    onEventCreated(newEvent);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    onClose();
  };

  // Agenda Days filtering
  const distinctDays = useMemo(() => {
    const days = Array.from(new Set(generatedAgenda.map(a => a.day || 'DAY 1')));
    return days.length > 0 ? days : ['DAY 1'];
  }, [generatedAgenda]);

  const filteredAgenda = useMemo(() => {
    if (selectedDayTab === 'ALL') return generatedAgenda;
    return generatedAgenda.filter(a => (a.day || 'DAY 1') === selectedDayTab);
  }, [generatedAgenda, selectedDayTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-scale-in"
        style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
      >
        {/* Header with Step Wizard Progress */}
        <div
          className="p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20"
          style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
        >
          <div>
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>AI Multi-Event Orchestration Wizard</span>
            </div>
            <h2 className="text-xl font-display font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {step === 'COMMON_DETAILS' && 'Step 1: Common Parameters & Logistics'}
              {step === 'EVENT_SPECIFIC' && `Step 2: Specific Requirements for ${type}`}
              {step === 'FORM_GEN' && 'Step 3: Tailored Registration Form Schema'}
              {step === 'AGENDA_GEN' && 'Step 4: AI Schedule & Intelligence Report'}
            </h2>
          </div>

          {/* Stepper Navigation Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950/40 p-1 rounded-2xl border border-slate-800 text-[11px] font-bold">
            <span className={`px-2.5 py-1 rounded-xl transition-all ${step === 'COMMON_DETAILS' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
              1. Basics
            </span>
            <span className={`px-2.5 py-1 rounded-xl transition-all ${step === 'EVENT_SPECIFIC' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
              2. {type.split(' ')[0]}
            </span>
            <span className={`px-2.5 py-1 rounded-xl transition-all ${step === 'FORM_GEN' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
              3. Form
            </span>
            <span className={`px-2.5 py-1 rounded-xl transition-all ${step === 'AGENDA_GEN' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
              4. Schedule
            </span>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-100 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* ========================================================================= */}
          {/* STEP 1: COMMON QUESTIONS (Standard for All Event Types)                   */}
          {/* ========================================================================= */}
          {step === 'COMMON_DETAILS' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center gap-3">
                <Bot className="w-5 h-5 shrink-0" />
                <span>
                  Every event begins with foundational logistics. Select your event category below to unlock tailored operational blocks in Step 2.
                </span>
              </div>

              {/* Event Type Grid Selector */}
              <div>
                <label className="block font-bold text-xs mb-2 uppercase tracking-wider text-slate-400">
                  Select Event Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {eventTypes.map((t) => {
                    const isSelected = type === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/10'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] leading-tight">{t}</span>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Event Title & Objective */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Event Title / Official Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. TechnoHack 2026 • AI Collegiate Challenge"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Event Description & Core Objectives
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the primary mission, technological tracks, and learning outcomes..."
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Date & Multi-day configuration */}
              <div className="p-4 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Timeline & Multi-Day Configuration
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={isMultiDay}
                      onChange={(e) => setIsMultiDay(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span>Multi-Day Event</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-xs"
                      style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">End Date</label>
                    <input
                      type="date"
                      disabled={!isMultiDay}
                      value={isMultiDay ? endDate : date}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-xs disabled:opacity-50"
                      style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Daily Start Time</label>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full px-3 py-2 rounded-xl border text-xs"
                      style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Daily End Time</label>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="05:00 PM"
                      className="w-full px-3 py-2 rounded-xl border text-xs"
                      style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Location & Human Resources Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Expected Total Participants
                  </label>
                  <input
                    type="number"
                    value={expectedParticipants}
                    onChange={(e) => setExpectedParticipants(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Faculty / Lead Organisers Count
                  </label>
                  <input
                    type="number"
                    value={numOrganizers}
                    onChange={(e) => setNumOrganizers(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Student Volunteers Count
                  </label>
                  <input
                    type="number"
                    value={numVolunteers}
                    onChange={(e) => setNumVolunteers(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Main Venue / Central Campus Location
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. University Convention Center & Computing Labs"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Fixed Activities & Break Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">
                    Fixed-Time Activities (Inauguration, Keynote, Dignitary visits)
                  </label>
                  <input
                    type="text"
                    value={fixedActivities}
                    onChange={(e) => setFixedActivities(e.target.value)}
                    placeholder="e.g. Inauguration at 09:30 AM, Keynote at 10:00 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-300">
                    Required Meals & Break Windows
                  </label>
                  <input
                    type="text"
                    value={requiredBreaks}
                    onChange={(e) => setRequiredBreaks(e.target.value)}
                    placeholder="e.g. Lunch (01:00 PM - 02:00 PM), Tea (04:00 PM)"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: DYNAMIC EVENT-SPECIFIC QUESTIONS (Custom for Each Event Type)    */}
          {/* ========================================================================= */}
          {step === 'EVENT_SPECIFIC' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-5 h-5 shrink-0" />
                  <span>
                    Configuring specific parameters for <strong>{type}</strong>. The engine uses these exact metrics to construct conflict-free parallel rooms and jury evaluation matrices.
                  </span>
                </div>
              </div>

              {/* HACKATHON SPECIFIC BLOCK */}
              {type === 'Hackathon' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Expected Teams Count</label>
                      <input
                        type="number"
                        value={eventConfig.numTeams}
                        onChange={(e) => updateConfig('numTeams', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Team Size Min / Max</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={eventConfig.teamSizeMin}
                          onChange={(e) => updateConfig('teamSizeMin', Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border text-center"
                          style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="number"
                          value={eventConfig.teamSizeMax}
                          onChange={(e) => updateConfig('teamSizeMax', Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border text-center"
                          style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Hackathon Duration (Hours)</label>
                      <input
                        type="number"
                        value={eventConfig.hackathonDurationHours}
                        onChange={(e) => updateConfig('hackathonDurationHours', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Jury Panels Count</label>
                      <input
                        type="number"
                        value={eventConfig.numPanels}
                        onChange={(e) => updateConfig('numPanels', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Presentation Slot per Team (Mins)</label>
                      <input
                        type="number"
                        value={eventConfig.evalDurationPerTeamMins}
                        onChange={(e) => updateConfig('evalDurationPerTeamMins', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Technical Mentors Count</label>
                      <input
                        type="number"
                        value={eventConfig.mentorCount}
                        onChange={(e) => updateConfig('mentorCount', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Judging & Evaluation Criteria</label>
                    <input
                      type="text"
                      value={eventConfig.judgeExpertise}
                      onChange={(e) => updateConfig('judgeExpertise', e.target.value)}
                      placeholder="e.g. Technical Architecture (30%), Innovation (30%), Live Execution (25%), Pitch (15%)"
                      className="w-full px-3.5 py-2.5 rounded-xl border"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              )}

              {/* PAPER PRESENTATION SPECIFIC BLOCK */}
              {type === 'Paper Presentation' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Expected Papers Count</label>
                      <input
                        type="number"
                        value={eventConfig.numPapers}
                        onChange={(e) => updateConfig('numPapers', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Presentation Time (mins)</label>
                      <input
                        type="number"
                        value={eventConfig.paperPresentationMins}
                        onChange={(e) => updateConfig('paperPresentationMins', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Q&A Defense Time (mins)</label>
                      <input
                        type="number"
                        value={eventConfig.paperQaMins}
                        onChange={(e) => updateConfig('paperQaMins', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Parallel Presentation Tracks / Rooms</label>
                      <input
                        type="number"
                        value={eventConfig.numParallelTracks}
                        onChange={(e) => updateConfig('numParallelTracks', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Paper Submission & Screening Deadline</label>
                      <input
                        type="date"
                        value={eventConfig.paperSubmissionDeadline}
                        onChange={(e) => updateConfig('paperSubmissionDeadline', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CODING CONTEST SPECIFIC BLOCK */}
              {type === 'Coding Contest' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Contest Duration (Mins)</label>
                      <input
                        type="number"
                        value={eventConfig.contestDurationMins}
                        onChange={(e) => updateConfig('contestDurationMins', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Number of Problems</label>
                      <input
                        type="number"
                        value={eventConfig.numProblems}
                        onChange={(e) => updateConfig('numProblems', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Coding Platform</label>
                      <input
                        type="text"
                        value={eventConfig.codingPlatform}
                        onChange={(e) => updateConfig('codingPlatform', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Problem Difficulty Distribution</label>
                    <input
                      type="text"
                      value={eventConfig.difficultyDistribution}
                      onChange={(e) => updateConfig('difficultyDistribution', e.target.value)}
                      placeholder="e.g. 2 Easy, 3 Medium, 1 Hard Dynamic Programming"
                      className="w-full px-3.5 py-2.5 rounded-xl border"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              )}

              {/* PROJECT EXPO SPECIFIC BLOCK */}
              {type === 'Project Expo' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Total Projects / Stalls</label>
                      <input
                        type="number"
                        value={eventConfig.numProjects}
                        onChange={(e) => updateConfig('numProjects', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Jury Evaluation per Stall (mins)</label>
                      <input
                        type="number"
                        value={eventConfig.stallEvalMins}
                        onChange={(e) => updateConfig('stallEvalMins', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Setup & Calibration Time (mins)</label>
                      <input
                        type="number"
                        value={eventConfig.stallSetupMins}
                        onChange={(e) => updateConfig('stallSetupMins', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Stalls Infrastructure & Power Requirements</label>
                    <input
                      type="text"
                      value={eventConfig.powerRequirements}
                      onChange={(e) => updateConfig('powerRequirements', e.target.value)}
                      placeholder="e.g. 230V 16A outlets per 4 stalls, High-speed LAN, Heavy prototype tables"
                      className="w-full px-3.5 py-2.5 rounded-xl border"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              )}

              {/* ROBOTICS CHALLENGE SPECIFIC BLOCK */}
              {type === 'Robotics Challenge' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Number of Robot Teams</label>
                      <input
                        type="number"
                        value={eventConfig.numTeams}
                        onChange={(e) => updateConfig('numTeams', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Practice / Calibration Time (mins)</label>
                      <input
                        type="number"
                        value={eventConfig.practiceTimeMins}
                        onChange={(e) => updateConfig('practiceTimeMins', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Pit Repair Buffer between Heats (mins)</label>
                      <input
                        type="number"
                        value={eventConfig.repairBufferMins}
                        onChange={(e) => updateConfig('repairBufferMins', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Arena Safety & Compliance Rules</label>
                    <input
                      type="text"
                      value={eventConfig.arenaSafetyRequirements}
                      onChange={(e) => updateConfig('arenaSafetyRequirements', e.target.value)}
                      placeholder="e.g. Polycarbonate protective shields, Fail-safe radio cutoffs, LiPo fire safe bags"
                      className="w-full px-3.5 py-2.5 rounded-xl border"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              )}

              {/* CULTURAL FEST SPECIFIC BLOCK */}
              {type === 'Cultural Fest' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Total Performances Count</label>
                      <input
                        type="number"
                        value={eventConfig.numPerformances}
                        onChange={(e) => updateConfig('numPerformances', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Avg Performance Slot (mins)</label>
                      <input
                        type="number"
                        value={eventConfig.durationPerPerfMins}
                        onChange={(e) => updateConfig('durationPerPerfMins', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Stage Changeover Buffer (mins)</label>
                      <input
                        type="number"
                        value={eventConfig.stageChangeoverMins}
                        onChange={(e) => updateConfig('stageChangeoverMins', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Stage Genres & Audio-Visual Specs</label>
                    <input
                      type="text"
                      value={eventConfig.performanceGenres}
                      onChange={(e) => updateConfig('performanceGenres', e.target.value)}
                      placeholder="e.g. Classical Solos, Western Choreography, Battle of Bands, Runway Fashion"
                      className="w-full px-3.5 py-2.5 rounded-xl border"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              )}

              {/* TECHNICAL QUIZ SPECIFIC BLOCK */}
              {type === 'Technical Quiz' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Number of Quiz Rounds</label>
                      <input
                        type="number"
                        value={eventConfig.quizRoundsCount}
                        onChange={(e) => updateConfig('quizRoundsCount', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Questions Breakdown</label>
                      <input
                        type="text"
                        value={eventConfig.questionsPerRound}
                        onChange={(e) => updateConfig('questionsPerRound', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Stage Quiz Masters Count</label>
                      <input
                        type="number"
                        value={eventConfig.moderatorCount}
                        onChange={(e) => updateConfig('moderatorCount', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Round Names & Structure</label>
                    <input
                      type="text"
                      value={eventConfig.quizRoundNames}
                      onChange={(e) => updateConfig('quizRoundNames', e.target.value)}
                      placeholder="e.g. Round 1: Written Prelims, Round 2: Tech Audio-Visual, Round 3: Infinite Bounce, Round 4: Rapid Buzzer"
                      className="w-full px-3.5 py-2.5 rounded-xl border"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              )}

              {/* WORKSHOP & BOOTCAMP SPECIFIC BLOCK */}
              {type === 'Workshop & Bootcamp' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Instructors / Speakers Count</label>
                      <input
                        type="number"
                        value={eventConfig.instructorCount}
                        onChange={(e) => updateConfig('instructorCount', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Hands-on Sessions Count</label>
                      <input
                        type="number"
                        value={eventConfig.sessionsCount}
                        onChange={(e) => updateConfig('sessionsCount', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Target Skill Level</label>
                      <select
                        value={eventConfig.skillLevel}
                        onChange={(e) => updateConfig('skillLevel', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      >
                        <option value="Beginner">Beginner (Zero Prior Knowledge)</option>
                        <option value="Beginner to Intermediate">Beginner to Intermediate</option>
                        <option value="Intermediate to Advanced">Intermediate to Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Workshop Technical Topic & Focus Area</label>
                    <input
                      type="text"
                      value={eventConfig.workshopTopic}
                      onChange={(e) => updateConfig('workshopTopic', e.target.value)}
                      placeholder="e.g. Building Full-Stack GenAI & Agentic Workflows with Next.js & Gemini"
                      className="w-full px-3.5 py-2.5 rounded-xl border"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Required Software Prerequisites</label>
                    <input
                      type="text"
                      value={eventConfig.prerequisiteTools}
                      onChange={(e) => updateConfig('prerequisiteTools', e.target.value)}
                      placeholder="e.g. VS Code, Node.js v20+, Git, Active Google Cloud / Gemini API key"
                      className="w-full px-3.5 py-2.5 rounded-xl border"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              )}

              {/* LIVE AI FEASIBILITY & CONFLICT INTELLIGENCE CARD */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Live Operational Feasibility & Workload Analysis
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    feasibilityCheck.isOverloaded
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {feasibilityCheck.isOverloaded ? 'Optimization Recommended' : 'Optimal Resource Balance'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Teams / Panel</span>
                    <strong className="text-slate-200 font-mono text-xs">{feasibilityCheck.teamsPerPanel} Teams</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Slot Duration</span>
                    <strong className="text-slate-200 font-mono text-xs">{feasibilityCheck.totalSlotMins} Mins/Team</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Total Eval Shift</span>
                    <strong className="text-indigo-400 font-mono text-xs">{feasibilityCheck.totalRequiredEvalMinutes} Mins</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Volunteer Ratio</span>
                    <strong className="text-slate-200 font-mono text-xs">1 : {feasibilityCheck.participantRatio} Students</strong>
                  </div>
                </div>

                {feasibilityCheck.isOverloaded ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>AI Suggestion:</strong> Each panel requires {feasibilityCheck.totalRequiredEvalMinutes} minutes of continuous evaluation. To prevent schedule delays, consider increasing jury panels to <strong>{feasibilityCheck.recommendedPanels}</strong> or reducing presentation duration to 8 mins.
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Jury evaluation workload is perfectly balanced. Total time fits cleanly within the designated session window.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: DYNAMIC REGISTRATION FORM GENERATOR                                */}
          {/* ========================================================================= */}
          {step === 'FORM_GEN' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Tailored Registration Form Schema
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fields automatically customized for <strong>{type}</strong>. Students will complete these upon registration.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAIForm}
                  disabled={isGeneratingForm}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold text-xs hover:bg-indigo-600/30 transition-all cursor-pointer"
                >
                  {isGeneratingForm ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Regenerate with AI</span>
                </button>
              </div>

              {/* Fields List */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {generatedFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 group"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          <span>{field.label}</span>
                          {field.required && <span className="text-rose-500 text-[10px]">*Required</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Type: {field.type} {field.options ? `• [${field.options.length} options]` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedFields(prev => prev.filter(f => f.id !== field.id));
                        }}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: OPTIMIZED SCHEDULE TIMELINE & AI INTELLIGENCE REPORT               */}
          {/* ========================================================================= */}
          {step === 'AGENDA_GEN' && (
            <div className="space-y-6 animate-fade-in">
              {/* Top AI Intelligence Report Header Card */}
              {intelligenceReport && (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-500/30 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                      <Activity className="w-4 h-4" />
                      <span>AI Operational Intelligence & Readiness Report</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Event Readiness:</span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold text-xs">
                        {intelligenceReport.readinessScore} / 100
                      </span>
                    </div>
                  </div>

                  {/* 4 Core Pillars Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Time Efficiency</span>
                      <strong className="text-indigo-400 font-display text-base font-bold">{intelligenceReport.timeEfficiency}%</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Resource Utilization</span>
                      <strong className="text-emerald-400 font-display text-base font-bold">{intelligenceReport.resourceUtilization}%</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Participant Experience</span>
                      <strong className="text-sky-400 font-display text-base font-bold">{intelligenceReport.participantExperience}%</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Feasibility Score</span>
                      <strong className="text-purple-400 font-display text-base font-bold">{intelligenceReport.operationalFeasibility}%</strong>
                    </div>
                  </div>

                  {/* Recommendations and Risks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {intelligenceReport.recommendations && intelligenceReport.recommendations.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> AI Recommendations
                        </span>
                        <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                          {intelligenceReport.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {intelligenceReport.conflictsResolved && (
                      <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-1.5">
                        <span className="font-bold text-indigo-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <ShieldAlert className="w-3.5 h-3.5" /> Verified Validations
                        </span>
                        <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                          {intelligenceReport.conflictsResolved.map((conf, i) => (
                            <li key={i}>✓ {conf}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Interactive Schedule Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Conflict-Free Event Timeline Schedule
                    </h3>
                    <p className="text-xs text-slate-400">
                      {generatedAgenda.length} sequenced operational blocks with role allocations and venue assignments.
                    </p>
                  </div>

                  {/* Day Tabs Filter */}
                  {distinctDays.length > 1 && (
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedDayTab('ALL')}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${selectedDayTab === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        All Days
                      </button>
                      {distinctDays.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDayTab(d)}
                          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${selectedDayTab === actionDayStyle(d) ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Agenda Items List */}
                <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                  {filteredAgenda.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border space-y-2 transition-all hover:border-slate-700"
                      style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-800 text-slate-300">
                            {item.day || 'DAY 1'}
                          </span>
                          <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                            {item.activity}
                          </span>
                          {item.sessionType && (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              item.sessionType === 'PARALLEL' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                              item.sessionType === 'KEYNOTE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              item.sessionType === 'EVALUATION' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                              item.sessionType === 'BREAK' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {item.sessionType}
                            </span>
                          )}
                        </div>

                        <span className="font-mono text-xs font-bold text-indigo-400">
                          {item.time} ({item.duration || '30 mins'})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <div>
                          <span className="font-medium text-slate-300">Venue:</span> {item.venue}
                        </div>
                        <div>
                          <span className="font-medium text-slate-300">Assigned:</span> {item.responsiblePerson}
                        </div>
                        <div>
                          <span className="font-medium text-slate-300">Resources:</span> {item.resources || 'Standard AV'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          className="p-4 border-t flex items-center justify-between gap-3 sticky bottom-0 z-20"
          style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
        >
          {step !== 'COMMON_DETAILS' ? (
            <button
              type="button"
              onClick={() => {
                if (step === 'EVENT_SPECIFIC') setStep('COMMON_DETAILS');
                if (step === 'FORM_GEN') setStep('EVENT_SPECIFIC');
                if (step === 'AGENDA_GEN') setStep('FORM_GEN');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step === 'COMMON_DETAILS' && (
              <button
                type="button"
                onClick={handleNextFromCommon}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Next: {type} Specifics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 'EVENT_SPECIFIC' && (
              <button
                type="button"
                onClick={handleNextFromSpecific}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Next: Review Registration Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 'FORM_GEN' && (
              <button
                type="button"
                onClick={handleNextFromForm}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Next: Generate AI Schedule</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}

            {step === 'AGENDA_GEN' && (
              <button
                type="button"
                onClick={handleFinalPublish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Create & Publish Event</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function actionDayStyle(d: string) {
  return d;
}
