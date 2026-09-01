import { GoogleGenAI } from '@google/genai';
import type { AgendaItem, FormField, PanelAllocation, PanelMember } from '@/types';

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

async function generateJson<T>(prompt: string, systemInstruction?: string): Promise<T | null> {
  const ai = getGenAI();
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      systemInstruction,
    },
  });

  const text = response.text?.trim() || '';
  return JSON.parse(text) as T;
}

export async function generateFormFields(payload: any) {
  try {
    const fields = await generateJson<FormField[]>(
      `Create a JSON array of student registration form fields for this collegiate event.\nEvent title: ${payload.eventTitle || 'Tech Innovate'}\nEvent type: ${payload.eventType || 'Hackathon'}\nDescription: ${payload.description || 'College event'}\nRules: ${payload.rules || 'Standard rules'}\nEligibility: ${payload.eligibility || 'College students'}\nMax team size: ${payload.teamSizeMax || 4}\nReturn only JSON.`,
      'You generate structured JSON schemas for college event forms.'
    );

    if (Array.isArray(fields) && fields.length > 0) {
      return { fields, source: 'gemini' };
    }
  } catch (error: any) {
    console.warn('Gemini generate-form failed, using fallback:', error?.message);
  }

  const eventType = String(payload.eventType || 'Hackathon').toLowerCase();
  const eventTitle = String(payload.eventTitle || '').toLowerCase();
  const teamSizeMax = Number(payload.teamSizeMax || 4);
  const isTeam = teamSizeMax > 1;

  const fields: FormField[] = [
    { id: 'f_name', label: 'Full Student Name', type: 'text', placeholder: 'e.g. Alex Morgan', required: true, helpText: 'As it should appear on certificates' },
    { id: 'f_roll', label: 'Roll / Registration Number', type: 'text', placeholder: 'e.g. 21CS084', required: true },
    { id: 'f_email', label: 'Institutional Email ID', type: 'email', placeholder: 'alex@college.edu', required: true },
    { id: 'f_phone', label: 'Contact Mobile Number', type: 'tel', placeholder: '+91 9876543210', required: true },
    { id: 'f_dept', label: 'Department / Branch', type: 'select', required: true, options: ['Computer Science & Engg', 'Information Technology', 'Electronics & Comm Engg', 'Electrical & Electronics', 'Mechanical Engineering', 'Artificial Intelligence & DS', 'MBA / Management'] },
    { id: 'f_year', label: 'Current Year of Study', type: 'select', required: true, options: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'] },
  ];

  if (isTeam) {
    fields.push(
      { id: 'f_team_name', label: 'Team Name', type: 'text', placeholder: 'e.g. Neural Ninjas', required: true },
      { id: 'f_team_members', label: 'Team Member Names & Roll Numbers', type: 'textarea', placeholder: '1. Jane Doe (21CS085)\n2. John Smith (21CS086)', required: true, helpText: `Max ${teamSizeMax} members including team leader` }
    );
  }

  if (eventType.includes('hackathon') || eventType.includes('coding') || eventTitle.includes('code')) {
    fields.push(
      { id: 'f_github', label: 'GitHub Profile or Project Repository', type: 'text', placeholder: 'https://github.com/team/project', required: true },
      { id: 'f_tech_stack', label: 'Primary Tech Stack', type: 'text', placeholder: 'Next.js, Node.js, PostgreSQL, Flutter, n8n', required: true },
      { id: 'f_dietary', label: 'Dietary Preference', type: 'select', required: false, options: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain Meal'] }
    );
  } else if (eventType.includes('paper') || eventType.includes('expo') || eventType.includes('project')) {
    fields.push(
      { id: 'f_track', label: 'Presentation Domain / Track', type: 'select', required: true, options: ['AI & Machine Learning', 'IoT & Embedded Systems', 'Cloud & Cyber Security', 'Clean Tech', 'Robotics & Automation'] },
      { id: 'f_abstract', label: 'Project Abstract / Paper Summary', type: 'textarea', placeholder: 'Summary in 150-250 words', required: true },
      { id: 'f_doc_link', label: 'Slides / Paper PDF Link', type: 'text', placeholder: 'https://drive.google.com/...', required: true }
    );
  }

  return { fields, source: 'intelligent-engine' };
}

export async function generateAgenda(payload: any) {
  try {
    const agenda = await generateJson<AgendaItem[]>(
      `Create a realistic minute-by-minute collegiate event agenda as JSON.\nEvent: ${payload.eventTitle || 'Campus Tech Fest'}\nType: ${payload.eventType || 'Hackathon'}\nStart: ${payload.startTime || '09:00 AM'}\nEnd: ${payload.endTime || '05:00 PM'}\nVenue: ${payload.venue || 'Auditorium'}\nRounds: ${payload.numRounds || 2}\nPanels: ${payload.numPanels || 3}\nExpected teams/students: ${payload.maxTeams || 30} teams / ${payload.maxStudents || 120} students\nReturn only JSON array items with id, time, activity, venue, responsiblePerson, description.`,
      'You generate structured JSON timelines for college events.'
    );

    if (Array.isArray(agenda) && agenda.length > 0) {
      return { agenda: agenda.map((item, index) => ({ ...item, id: item.id || `ag_${index + 1}`, status: item.status || 'PENDING' })), source: 'gemini' };
    }
  } catch (error: any) {
    console.warn('Gemini generate-agenda failed, using fallback:', error?.message);
  }

  const venue = payload.venue || 'Campus Auditorium';
  const numRounds = Number(payload.numRounds || 2);
  const agenda: AgendaItem[] = [
    { id: 'ag_1', time: '08:30 AM - 09:30 AM', activity: 'Participant Check-in & QR Attendance', venue: 'Main Foyer & Registration Desk', responsiblePerson: 'Registration Volunteers', description: 'Scan QR codes and distribute badge kits.', status: 'PENDING' },
    { id: 'ag_2', time: '09:30 AM - 10:00 AM', activity: 'Inauguration & Welcome Address', venue, responsiblePerson: 'Faculty Organisers & Chief Guest', description: 'Opening ceremony and jury introduction.', status: 'PENDING' },
    { id: 'ag_3', time: '10:00 AM - 10:20 AM', activity: 'Event Rules & Problem Track Release', venue, responsiblePerson: 'Lead Coordinator', description: 'Rules, room allocation, and evaluation criteria.', status: 'PENDING' },
    { id: 'ag_4', time: '10:30 AM - 12:30 PM', activity: 'Round 1: Preliminary Evaluation', venue: 'Assigned Evaluation Rooms', responsiblePerson: 'Panel Members & Room Volunteers', description: 'Teams present initial solutions to assigned panels.', status: 'PENDING' },
    { id: 'ag_5', time: '12:30 PM - 01:30 PM', activity: 'Networking Lunch & Refreshment Break', venue: 'Food Court & Student Pavilion', responsiblePerson: 'Hospitality Volunteers', description: 'Lunch for participants, jury, and organizers.', status: 'PENDING' },
    { id: 'ag_6', time: '01:30 PM - 03:30 PM', activity: numRounds > 1 ? 'Round 2: Prototype & Code Review' : 'Final Demonstrations', venue: 'Advanced Computing Labs', responsiblePerson: 'Panel Members & Technical Leads', description: 'Live system checks, Q&A, and scoring.', status: 'PENDING' },
    { id: 'ag_7', time: '03:30 PM - 04:00 PM', activity: 'Jury Deliberation & Score Normalization', venue: 'Control Room', responsiblePerson: 'Panel Chairs & Organisers', description: 'Tabulate scores and confirm winners.', status: 'PENDING' },
    { id: 'ag_8', time: '04:00 PM - 04:45 PM', activity: 'Prize & Certificate Ceremony', venue, responsiblePerson: 'Principal & Organising Committee', description: 'Awards and verified certificate dispatch.', status: 'PENDING' },
  ];

  return { agenda, source: 'intelligent-engine' };
}

function parseTime(value: string | undefined, fallbackHour: number) {
  if (!value) return fallbackHour * 60;
  const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return fallbackHour * 60;
  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const period = match[3]?.toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function formatTime(totalMinutes: number) {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

function normalizeTeam(team: any, index: number) {
  if (typeof team === 'string') {
    return { id: `team_${index + 1}`, name: team, leadName: `Lead ${index + 1}`, rollNo: `TEAM-${index + 1}` };
  }

  return {
    id: team.id || `team_${index + 1}`,
    name: team.name || team.teamName || `Team ${index + 1}`,
    leadName: team.leadName || team.studentName || team.leadStudentName || `Lead ${index + 1}`,
    rollNo: team.rollNo || team.rollNumber || team.leadRollNo || `TEAM-${index + 1}`,
  };
}

function normalizePanels(panels: PanelMember[] | undefined, rooms: string[] | undefined) {
  if (Array.isArray(panels) && panels.length > 0) {
    return panels.map((panel, index) => ({
      id: panel.id || `panel_${index + 1}`,
      name: panel.name || `Panel ${index + 1}`,
      room: panel.assignedRoom || rooms?.[index] || `Room ${101 + index}`,
    }));
  }

  return [
    { id: 'p1', name: 'Panel 1 (AI & ML)', room: rooms?.[0] || 'Room 101' },
    { id: 'p2', name: 'Panel 2 (Full Stack)', room: rooms?.[1] || 'Room 102' },
    { id: 'p3', name: 'Panel 3 (Cloud & IoT)', room: rooms?.[2] || 'Room 103' },
  ];
}

export async function allocatePanels(payload: any) {
  const rooms = payload.availableRooms || payload.rooms;
  const panelList = normalizePanels(payload.panels, rooms);
  const rawTeams = Array.isArray(payload.teams) && payload.teams.length > 0 ? payload.teams : Array.from({ length: 12 }, (_, index) => `Team ${index + 1}`);
  const teamList = rawTeams.map(normalizeTeam);
  const numRounds = Math.max(1, Number(payload.numRounds || payload.roundNumber || 1));
  const slotLength = Math.max(5, Number(payload.presentationDuration || payload.presentationDurationMinutes || 10) + Number(payload.reviewDuration || 5));
  const startMinutes = parseTime(payload.startTime, 10);
  const allocations: PanelAllocation[] = [];

  for (let round = 1; round <= numRounds; round++) {
    const panelSlotCount: Record<string, number> = {};
    panelList.forEach((panel) => {
      panelSlotCount[panel.id] = 0;
    });

    teamList.forEach((team, index) => {
      const panel = panelList[index % panelList.length];
      const slotIndex = panelSlotCount[panel.id]++;
      const start = startMinutes + slotIndex * slotLength + (round - 1) * Math.ceil(teamList.length / panelList.length) * slotLength;
      const end = start + slotLength;

      allocations.push({
        id: `alloc_r${round}_${team.id}_${index + 1}`,
        eventId: payload.eventId || 'evt_1',
        teamId: team.id,
        teamName: team.name,
        leadStudentName: team.leadName,
        leadRollNo: team.rollNo,
        panelId: panel.id,
        panelName: panel.name,
        room: panel.room,
        timeSlot: `${formatTime(start)} - ${formatTime(end)}`,
        roundNumber: round,
        status: 'SCHEDULED',
      });
    });
  }

  return { allocations, totalAllocated: allocations.length, source: 'node-allocation-engine' };
}

export async function generateEventInsights(payload: any) {
  const stats = payload.stats || payload;
  const totalRegistered = Number(stats.totalRegistered || 0);
  const totalAttended = Number(stats.totalAttended || 0);
  const round1Count = Number(stats.round1Done || stats.round1Count || 0);
  const round2Count = Number(stats.round2Done || stats.round2Count || 0);
  const finalDone = Number(stats.finalDone || 0);
  const attendanceRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;
  const retentionBase = totalAttended || 1;
  const completionRate = Math.round(((finalDone || round2Count || round1Count) / retentionBase) * 100);
  const dropoutRate = Math.max(0, 100 - completionRate);

  try {
    const ai = await generateJson<any>(
      `Analyze this event and return JSON with summary, highlights, dropoutAnalysis, recommendations.\nEvent: ${payload.eventTitle}\nType: ${payload.eventType}\nStats: ${JSON.stringify(stats)}`,
      'You generate concise operational analytics for college event organizers.'
    );

    if (ai) {
      return {
        insights: {
          summary: ai.summary || `Attendance is ${attendanceRate}% with ${completionRate}% stage completion.`,
          highlights: ai.highlights || ai.keyHighlights || [],
          dropoutAnalysis: ai.dropoutAnalysis || (ai.bottlenecksIdentified || []).join(' '),
          recommendations: ai.recommendations || ai.actionableRecommendations || [],
        },
        attendanceRate,
        dropoffRate: dropoutRate,
        generatedAt: new Date().toISOString(),
        source: 'gemini',
      };
    }
  } catch (error: any) {
    console.warn('Gemini event-insights failed, using fallback:', error?.message);
  }

  const insights = {
    summary: `${payload.eventTitle || 'This event'} is running at ${attendanceRate}% attendance with ${completionRate}% stage completion. The strongest operational gains will come from tighter reminders, panel load balancing, and automated certificate follow-up.`,
    highlights: [
      `${totalAttended} of ${totalRegistered} registered participants checked in.`,
      `${round1Count} teams completed Round 1 and ${round2Count || finalDone} reached later evaluation stages.`,
      'Panel, attendance, and certificate events are ready to be pushed into n8n automation flows.',
    ],
    dropoutAnalysis: `${dropoutRate}% estimated drop-off from attendance to final tracked completion. Trigger n8n reminders before each round and absence alerts after missed check-ins.`,
    recommendations: [
      'Send WhatsApp/email reminders 30 minutes before round start.',
      'Trigger certificate generation immediately after winner status is published.',
      'Push volunteer duty changes to n8n so room leads receive live updates.',
    ],
  };

  return {
    insights,
    attendanceRate,
    dropoffRate: dropoutRate,
    generatedAt: new Date().toISOString(),
    source: 'intelligent-analytics',
  };
}

export async function answerEventAssistant(payload: any) {
  const question = payload.question || payload.query || '';
  const context = payload.eventContext || {};

  try {
    const ai = getGenAI();
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Answer this organizer question using the event context.\nQuestion: ${question}\nContext: ${JSON.stringify(context)}`,
      });
      const answer = response.text?.trim() || 'I analyzed the current event context.';
      return { answer, reply: answer, source: 'gemini' };
    }
  } catch (error: any) {
    console.warn('Gemini assistant failed, using fallback:', error?.message);
  }

  const q = String(question).toLowerCase();
  const totalRegistered = context.totalRegistered ?? 48;
  const presentCount = context.presentCount ?? context.totalAttended ?? 41;
  const certificatesCount = context.certificatesCount ?? context.pendingCertificates ?? 12;
  const volunteersCount = context.volunteersCount ?? context.activeVolunteers ?? 6;

  let answer: string;
  if (q.includes('attendance') || q.includes('turnout') || q.includes('register')) {
    answer = `Current turnout is ${presentCount}/${totalRegistered}, which is ${Math.round((presentCount / (totalRegistered || 1)) * 100)}%.`;
  } else if (q.includes('certificate')) {
    answer = `${certificatesCount} certificate records are available for this event. Use n8n to trigger email dispatch after eligibility is confirmed.`;
  } else if (q.includes('volunteer')) {
    answer = `${volunteersCount} volunteer assignments are active. n8n can broadcast duty changes when assignments are updated.`;
  } else if (q.includes('room') || q.includes('panel')) {
    answer = `Panel allocations are available in the event matrix. Use the panel allocation endpoint or the n8n webhook topic allocation.published to notify teams.`;
  } else {
    answer = `All core systems are ready for ${context.title || context.eventTitle || 'this event'}: registrations, attendance, panels, certificates, analytics, and n8n automation hooks.`;
  }

  return { answer, reply: answer, source: 'smart-assistant' };
}
