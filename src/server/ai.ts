import { GoogleGenAI } from '@google/genai';
import type { AgendaItem, FormField, PanelAllocation, PanelMember, IntelligenceReport } from '@/types';

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
  const eventType = String(payload.eventType || 'Hackathon');
  const teamSizeMax = Number(payload.teamSizeMax || 4);
  const isTeam = teamSizeMax > 1;

  try {
    const fields = await generateJson<FormField[]>(
      `Create a tailored JSON array of student registration form fields for this collegiate event.
Event Title: ${payload.eventTitle || 'Campus Event'}
Event Type: ${eventType}
Description: ${payload.description || ''}
Max Team Size: ${teamSizeMax}
Is Team Event: ${isTeam}
Event Specific Config: ${JSON.stringify(payload.eventConfig || {})}
Requirements: Include only fields necessary for this specific event type (e.g., GitHub for coding/hackathons, Abstract & Slides for Paper Presentations, Robot weight/specs for Robotics, Platform handle for Coding contests, Track/Instrument for Cultural, Skill level for Workshops).
Return only JSON array of FormField objects.`,
      'You generate structured JSON schemas tailored for specific college events.'
    );

    if (Array.isArray(fields) && fields.length > 0) {
      return { fields, source: 'gemini' };
    }
  } catch (error: any) {
    console.warn('Gemini generate-form failed, using intelligent-engine fallback:', error?.message);
  }

  // Base Common Fields
  const fields: FormField[] = [
    { id: 'f_name', label: 'Full Student Name', type: 'text', placeholder: 'e.g. Alex Morgan', required: true, helpText: 'As it should appear on official certificates' },
    { id: 'f_roll', label: 'Roll / Registration Number', type: 'text', placeholder: 'e.g. 21CS084', required: true },
    { id: 'f_email', label: 'Institutional Email ID', type: 'email', placeholder: 'alex@college.edu', required: true },
    { id: 'f_phone', label: 'Contact Mobile Number', type: 'tel', placeholder: '+91 98765 43210', required: true },
    { id: 'f_dept', label: 'Department / Branch', type: 'select', required: true, options: ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & DS', 'Electronics & Comm Engg', 'Electrical & Electronics', 'Mechanical Engineering', 'MBA / Management'] },
    { id: 'f_year', label: 'Current Year of Study', type: 'select', required: true, options: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'] },
  ];

  if (isTeam) {
    fields.push(
      { id: 'f_team_name', label: 'Team / Squad Name', type: 'text', placeholder: 'e.g. Neural Ninjas', required: true },
      { id: 'f_team_members', label: 'Team Member Names & Roll Numbers', type: 'textarea', placeholder: '1. Member One (Roll No)\n2. Member Two (Roll No)\n3. Member Three (Roll No)', required: true, helpText: `Max ${teamSizeMax} members including team lead` }
    );
  }

  // Event Type Specific Ingestion Fields
  switch (eventType) {
    case 'Hackathon':
      fields.push(
        { id: 'f_github', label: 'GitHub Profile or Team Org Link', type: 'text', placeholder: 'https://github.com/team-org', required: true },
        { id: 'f_tech_stack', label: 'Primary Tech Stack & Frameworks', type: 'text', placeholder: 'Next.js, Python FastAPI, PostgreSQL, TensorFlow', required: true },
        { id: 'f_track', label: 'Hackathon Theme / Domain Track', type: 'select', required: true, options: ['AI & Intelligent Systems', 'Web3 & Decentralized Apps', 'HealthTech & BioInformatics', 'FinTech & Cybersecurity', 'Open Innovation & IoT'] },
        { id: 'f_hardware_req', label: 'Special Hardware / Lab Power Requirements', type: 'text', placeholder: 'e.g. 2x GPU instances, Raspberry Pi, Extra Power Sockets', required: false }
      );
      break;

    case 'Paper Presentation':
      fields.push(
        { id: 'f_paper_title', label: 'Research Paper / Manuscript Title', type: 'text', placeholder: 'e.g. Quantum-Resistant Cryptography in Distributed IoT', required: true },
        { id: 'f_track', label: 'Research Domain / Track', type: 'select', required: true, options: ['Artificial Intelligence & Deep Learning', 'IoT & Cyber-Physical Systems', 'Cloud & High Performance Computing', 'Renewable Energy & Robotics', 'Signal Processing & VLSI'] },
        { id: 'f_abstract', label: 'Paper Abstract (150-250 words)', type: 'textarea', placeholder: 'Provide the problem statement, proposed methodology, and key results...', required: true },
        { id: 'f_doc_link', label: 'Manuscript / Presentation Slides PDF Link', type: 'text', placeholder: 'https://drive.google.com/file/...', required: true }
      );
      break;

    case 'Coding Contest':
      fields.push(
        { id: 'f_handle', label: 'HackerRank / LeetCode / CodeChef Profile Handle', type: 'text', placeholder: 'e.g. alex_coder99', required: true },
        { id: 'f_preferred_lang', label: 'Primary Programming Language', type: 'select', required: true, options: ['C++', 'Java 21', 'Python 3.12', 'C', 'Rust', 'Go'] },
        { id: 'f_experience', label: 'Competitive Programming Experience', type: 'select', required: false, options: ['Beginner (< 6 months)', 'Intermediate (1-2 years)', 'Advanced / College Team'] }
      );
      break;

    case 'Project Expo':
      fields.push(
        { id: 'f_project_name', label: 'Project / Prototype Title', type: 'text', placeholder: 'e.g. Smart Autonomous Crop Health Monitor', required: true },
        { id: 'f_category', label: 'Exhibition Category', type: 'select', required: true, options: ['Software & AI Applications', 'Hardware & Embedded Prototypes', 'Robotics & Automation', 'Green Tech & Sustainability'] },
        { id: 'f_project_desc', label: 'Project Summary & Innovation Highlights', type: 'textarea', placeholder: 'Describe your working prototype, hardware components used, and real-world impact...', required: true },
        { id: 'f_stall_req', label: 'Stall Requirements (Power, Space, Wi-Fi, Water)', type: 'text', placeholder: 'e.g. 230V 16A Power outlet, 2 Tables, High-speed LAN', required: true }
      );
      break;

    case 'Robotics Challenge':
      fields.push(
        { id: 'f_bot_name', label: 'Robot Name & Model', type: 'text', placeholder: 'e.g. Bolt-V4 Titan', required: true },
        { id: 'f_bot_type', label: 'Robot Category', type: 'select', required: true, options: ['Line Follower & Maze Solver', 'Robo-War / Combat Bot (Under 15kg)', 'All-Terrain Rover', 'Robo-Soccer / Autonomous Racer'] },
        { id: 'f_bot_weight', label: 'Robot Weight (kg) & Dimensions (L x W x H cm)', type: 'text', placeholder: 'e.g. 12.5 kg | 45 x 40 x 30 cm', required: true },
        { id: 'f_power_specs', label: 'Battery Chemistry & Motor Specifications', type: 'text', placeholder: 'e.g. 4S LiPo 5000mAh, 12V 600RPM Planetary DC Motors', required: true }
      );
      break;

    case 'Cultural Fest':
      fields.push(
        { id: 'f_perf_type', label: 'Performance Genre / Category', type: 'select', required: true, options: ['Solo Classical / Western Singing', 'Group Choreography / Dance', 'Battle of the Bands / Rock', 'Theatrical Drama / Mime', 'Fashion Show / Runway', 'Stand-up Comedy / Beatboxing'] },
        { id: 'f_perf_title', label: 'Performance Title / Song List', type: 'text', placeholder: 'e.g. Symphony of Ragas & Rhythm', required: true },
        { id: 'f_audio_link', label: 'Audio Track / Instrumental Track Drive Link', type: 'text', placeholder: 'https://drive.google.com/audio-track.mp3', required: false },
        { id: 'f_props_req', label: 'Stage Props & Lighting / Mic Requirements', type: 'text', placeholder: 'e.g. 4 Cordless Mics, Fog Machine, Spotlight focus', required: false }
      );
      break;

    case 'Technical Quiz':
      fields.push(
        { id: 'f_quiz_track', label: 'Preferred Quiz Track / Specialization', type: 'select', required: true, options: ['General Tech & Industry Trivia', 'Algorithms & Computer Science', 'AI & Machine Learning Frontier', 'Gadgets, Space & Sci-Fi'] },
        { id: 'f_quiz_experience', label: 'Previous Inter-Collegiate Quiz Participation', type: 'select', required: false, options: ['First Time', 'Participated in College Fests', 'National / Zonal Finalist'] }
      );
      break;

    case 'Workshop & Bootcamp':
      fields.push(
        { id: 'f_skill_level', label: 'Current Proficiency Level in Topic', type: 'select', required: true, options: ['Absolute Beginner (Zero Prior Knowledge)', 'Familiar with Basics', 'Intermediate Practitioner', 'Looking for Advanced Industry Patterns'] },
        { id: 'f_laptop_os', label: 'Laptop Operating System for Hands-on Lab', type: 'select', required: true, options: ['Windows 11 / 10', 'macOS (Apple Silicon / Intel)', 'Linux (Ubuntu / Fedora / Arch)'] },
        { id: 'f_prereq_software', label: 'Prerequisite Tools Installed (Docker, VS Code, Git)', type: 'select', required: true, options: ['All Prerequisites Pre-installed', 'Need assistance during setup hour'] }
      );
      break;

    default:
      break;
  }

  return { fields, source: 'intelligent-engine' };
}

export function parseTimeToMinutes(timeStr: string | undefined, defaultHour = 9, defaultMinute = 0): number {
  if (!timeStr) return defaultHour * 60 + defaultMinute;
  const cleaned = timeStr.trim().toLowerCase();
  const isPM = cleaned.includes('pm');
  const isAM = cleaned.includes('am');

  const match = cleaned.match(/(\d{1,2}):?(\d{2})?/);
  if (!match) return defaultHour * 60 + defaultMinute;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function formatMinutesToTime(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  let hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  return `${paddedHours}:${paddedMinutes} ${ampm}`;
}

export async function generateAgenda(payload: any) {
  const eventTitle = payload.eventTitle || 'Campus Innovation Event';
  const eventType = payload.eventType || 'Hackathon';
  const venue = payload.venue || 'Auditorium & Laboratories';
  const startTime = payload.startTime || '09:00 AM';
  const endTime = payload.endTime || '05:00 PM';
  const isMultiDay = Boolean(payload.isMultiDay || payload.startDate !== payload.endDate);
  const numTeams = Number(payload.maxTeams || payload.numTeams || 20);
  const numParticipants = Number(payload.maxStudents || payload.numParticipants || 100);
  const numPanels = Number(payload.numPanels || 3);
  const eventConfig = payload.eventConfig || {};

  const startMins = parseTimeToMinutes(startTime, 9, 0);
  const endMins = parseTimeToMinutes(endTime, 17, 0);
  const totalDurationMins = Math.max(120, endMins - startMins);

  try {
    const aiResult = await generateJson<{
      agenda: AgendaItem[];
      intelligenceReport: IntelligenceReport;
    }>(
      `Generate a comprehensive, conflict-free collegiate event schedule.
Event Title: ${eventTitle}
Event Type: ${eventType}
Main Venue: ${venue}
EXACT Start Time: ${startTime} (${formatMinutesToTime(startMins)})
EXACT End Time: ${endTime} (${formatMinutesToTime(endMins)})
Is Multi-Day: ${isMultiDay}
Expected Participants: ${numParticipants}
Expected Teams: ${numTeams}
Panels/Judges: ${numPanels}
Event Specific Constraints: ${JSON.stringify(eventConfig)}

CRITICAL TIME RESTRICTION:
- The very first activity on Day 1 MUST start at exactly "${startTime}".
- The final concluding activity on each day MUST conclude at or before "${endTime}".
- NO activities may run past "${endTime}".

Required Output Structure:
{
  "agenda": [
    {
      "id": "ag_1",
      "day": "DAY 1",
      "time": "09:00 AM - 09:30 AM",
      "duration": "30 mins",
      "activity": "Activity Name",
      "venue": "Specific Room / Hall",
      "responsiblePerson": "Assigned Coordinator / Volunteer Group",
      "participants": "Audience / Cohort",
      "resources": "Required AV / Hardware",
      "sessionType": "MAIN | PARALLEL | BREAK | SETUP | BUFFER | EVALUATION | KEYNOTE",
      "description": "Short operational guide",
      "status": "PENDING"
    }
  ]
}
Return only JSON.`,
      'You are a collegiate event operations and scheduling AI architect.'
    );

    if (aiResult?.agenda && Array.isArray(aiResult.agenda) && aiResult.agenda.length > 0) {
      // Validate that items fit strictly within startMins and endMins
      const validatedAgenda = fitAgendaWithinTimeWindow(aiResult.agenda, startMins, endMins, isMultiDay);
      return {
        agenda: validatedAgenda,
        source: 'gemini',
      };
    }
  } catch (error: any) {
    console.warn('Gemini generate-agenda failed, using mathematically constrained scheduler:', error?.message);
  }

  // Exact mathematically fitted schedule
  const agenda = buildFittedEventSchedule(eventType, venue, startMins, endMins, isMultiDay, numTeams, numPanels);
  return { agenda, source: 'intelligent-engine' };
}

function fitAgendaWithinTimeWindow(
  items: AgendaItem[],
  startMins: number,
  endMins: number,
  isMultiDay: boolean
): AgendaItem[] {
  const day1Items = items.filter((it) => (it.day || 'DAY 1').toUpperCase().includes('DAY 1') || !it.day);
  const day2Items = items.filter((it) => (it.day || '').toUpperCase().includes('DAY 2'));

  const adjustDayItems = (dayList: AgendaItem[], dayTag: string) => {
    if (dayList.length === 0) return [];
    const availableMins = Math.max(60, endMins - startMins);
    const count = dayList.length;

    let currentCursor = startMins;
    return dayList.map((item, idx) => {
      const isLast = idx === count - 1;
      // Default item fraction
      const slotMins = isLast ? (endMins - currentCursor) : Math.max(15, Math.floor(availableMins / count));
      const slotStart = currentCursor;
      const slotEnd = isLast ? endMins : Math.min(endMins, currentCursor + slotMins);
      currentCursor = slotEnd;

      return {
        ...item,
        id: item.id || `ag_${dayTag.toLowerCase()}_${idx + 1}`,
        day: dayTag,
        time: `${formatMinutesToTime(slotStart)} - ${formatMinutesToTime(slotEnd)}`,
        duration: `${slotEnd - slotStart} mins`,
        status: item.status || 'PENDING',
      };
    });
  };

  const adjustedDay1 = adjustDayItems(day1Items, 'DAY 1');
  const adjustedDay2 = isMultiDay && day2Items.length > 0 ? adjustDayItems(day2Items, 'DAY 2') : [];

  return [...adjustedDay1, ...adjustedDay2];
}

interface ActivityTemplate {
  activity: string;
  weight: number; // proportional duration weight
  sessionType: 'MAIN' | 'PARALLEL' | 'BREAK' | 'SETUP' | 'BUFFER' | 'EVALUATION' | 'KEYNOTE';
  responsiblePerson: string;
  resources: string;
  description: string;
  venueSuffix?: string;
}

function buildFittedEventSchedule(
  eventType: string,
  venue: string,
  startMins: number,
  endMins: number,
  isMultiDay: boolean,
  numTeams: number,
  numPanels: number
): AgendaItem[] {
  const templatesByEventType: Record<string, { day1: ActivityTemplate[]; day2?: ActivityTemplate[] }> = {
    Hackathon: {
      day1: [
        { activity: 'Hackathon Check-in & Team Kit Distribution', weight: 0.10, sessionType: 'SETUP', responsiblePerson: 'Registration Desk', resources: 'QR Scanner & ID Lanyards', description: 'Badge verification & workstation allotment.', venueSuffix: 'Main Foyer' },
        { activity: 'Inauguration & Problem Statements Release', weight: 0.10, sessionType: 'KEYNOTE', responsiblePerson: 'Convener & Industry Mentors', resources: 'Stage AV & Projector', description: 'Theme reveal and evaluation rubrics briefing.', venueSuffix: 'Auditorium' },
        { activity: 'Sprint 1: Architecture & Core Implementation', weight: 0.30, sessionType: 'MAIN', responsiblePerson: 'Lab Coordinators', resources: 'High-speed LAN & Power Outlets', description: 'Teams begin repository setup and base prototypes.', venueSuffix: 'Innovation Labs' },
        { activity: 'Power Lunch & Networking Break', weight: 0.12, sessionType: 'BREAK', responsiblePerson: 'Hospitality Volunteers', resources: 'Buffet Setup', description: 'Nutritious lunch and informal mentor interaction.', venueSuffix: 'Dining Hall' },
        { activity: 'Sprint 2: Parallel Mentor Review & Code Clinics', weight: 0.20, sessionType: 'PARALLEL', responsiblePerson: 'Industry Mentors (8 Staff)', resources: 'Mentorship Pods', description: 'Technical guidance on bugs and architectural blockers.', venueSuffix: 'Breakout Pods' },
        { activity: 'Round 1: Parallel Jury Evaluation & Demo', weight: 0.10, sessionType: 'EVALUATION', responsiblePerson: `${numPanels} Jury Panels`, resources: 'HDMI Screens & Scoring App', description: 'Squads present prototype progress to assigned panels.', venueSuffix: `${numPanels} Evaluation Rooms` },
        { activity: 'Award Ceremony & Certificate Distribution', weight: 0.08, sessionType: 'KEYNOTE', responsiblePerson: 'Principal & Organisers', resources: 'Trophies & Digital Certs', description: 'Winners announcement and digital certificate dispatch.', venueSuffix: 'Auditorium' },
      ],
      day2: [
        { activity: 'Day 2 Breakfast & Final Code Freeze', weight: 0.15, sessionType: 'SETUP', responsiblePerson: 'Technical Reviewers', resources: 'GitHub Verifier', description: 'Final git push freeze and breakfast.', venueSuffix: 'Labs' },
        { activity: 'Round 2: Parallel Jury Evaluation & Code Audit', weight: 0.35, sessionType: 'EVALUATION', responsiblePerson: 'Jury Panel', resources: 'Scoring Tablets', description: 'In-depth code audit and performance testing.', venueSuffix: 'Jury Rooms' },
        { activity: 'Lunch & Jury Score Normalization', weight: 0.15, sessionType: 'BREAK', responsiblePerson: 'Hospitality & Jury Chair', resources: 'Dining Buffet', description: 'Lunch and top 5 finalist selection.', venueSuffix: 'Dining Area' },
        { activity: 'Grand Finale: Top 5 Live Stage Pitches', weight: 0.20, sessionType: 'KEYNOTE', responsiblePerson: 'Chief Jury & Anchors', resources: 'Main Stage AV', description: 'Final stage pitches in front of full audience.', venueSuffix: 'Main Auditorium' },
        { activity: 'Valedictory & Verified Certificate Handout', weight: 0.15, sessionType: 'KEYNOTE', responsiblePerson: 'Principal & Dignitaries', resources: 'Trophies & Certificates', description: 'Grand champion crowning.', venueSuffix: 'Main Stage' },
      ],
    },

    'Paper Presentation': {
      day1: [
        { activity: 'Author Registration & Slide Upload Verification', weight: 0.10, sessionType: 'SETUP', responsiblePerson: 'Track Coordinators', resources: 'Presentation Laptops', description: 'Slide check and author badge distribution.', venueSuffix: 'Seminar Foyer' },
        { activity: 'Keynote Address on Emerging Research Paradigms', weight: 0.12, sessionType: 'KEYNOTE', responsiblePerson: 'Session Chair & Guest Scientist', resources: 'Keynote AV', description: 'Opening address.', venueSuffix: 'Main Seminar Hall' },
        { activity: `Technical Session 1: Parallel Oral Presentations (${numPanels} Tracks)`, weight: 0.35, sessionType: 'PARALLEL', responsiblePerson: 'Session Chairs & Jury', resources: 'Timers & Digital Rubrics', description: '8-min paper presentation + 4-min Q&A defense per author.', venueSuffix: `${numPanels} Track Rooms` },
        { activity: 'Lunch Break & Academic Networking', weight: 0.13, sessionType: 'BREAK', responsiblePerson: 'Hospitality Staff', resources: 'Dining Setup', description: 'Networking lunch.', venueSuffix: 'Executive Dining Hall' },
        { activity: 'Technical Session 2: Advanced Topics & Defense', weight: 0.20, sessionType: 'EVALUATION', responsiblePerson: 'Review Panels', resources: 'Projectors & Screens', description: 'Afternoon presentations and poster evaluations.', venueSuffix: 'Track Rooms' },
        { activity: 'Best Paper in Track Awards & Valedictory', weight: 0.10, sessionType: 'KEYNOTE', responsiblePerson: 'Dean of Research & HOD', resources: 'Certificates & Plaques', description: 'Best paper awards distribution.', venueSuffix: 'Main Seminar Hall' },
      ],
    },

    'Coding Contest': {
      day1: [
        { activity: 'Contestant Check-in & Lab Workstation Allotment', weight: 0.12, sessionType: 'SETUP', responsiblePerson: 'Lab Invigilators', resources: 'Terminals & Isolated Subnet', description: 'Login and IDE configuration.', venueSuffix: 'Computing Labs' },
        { activity: 'Platform Rules Briefing & Warmup Trial Run', weight: 0.10, sessionType: 'MAIN', responsiblePerson: 'Contest Admin', resources: 'Scoreboard Screen', description: 'Trial problem submission check.', venueSuffix: 'Computing Labs' },
        { activity: 'Round 1: Algorithmic Sprint & Data Structures', weight: 0.35, sessionType: 'EVALUATION', responsiblePerson: 'Invigilators & System Admins', resources: 'Automated Test Runner', description: '4 algorithmic problems under exam mode.', venueSuffix: 'Computing Labs' },
        { activity: 'Lunch Break & Mid-Contest Standings Review', weight: 0.13, sessionType: 'BREAK', responsiblePerson: 'Hospitality Team', resources: 'Cafeteria Buffet', description: 'Lunch and scoreboard review.', venueSuffix: 'Cafeteria' },
        { activity: 'Round 2: Extreme Optimization & Dynamic Programming', weight: 0.20, sessionType: 'EVALUATION', responsiblePerson: 'Problem Setters & Jury', resources: 'Plagiarism Checker', description: 'Advanced problem challenges with frozen leaderboard.', venueSuffix: 'Computing Labs' },
        { activity: 'Editorial Walkthrough & Prize Distribution', weight: 0.10, sessionType: 'KEYNOTE', responsiblePerson: 'Chief Problem Setter & HOD', resources: 'Editorial Slides & Awards', description: 'Solution discussions and winner declarations.', venueSuffix: 'Auditorium' },
      ],
    },

    'Project Expo': {
      day1: [
        { activity: 'Stall Setup, Power Hookup & Prototype Assembly', weight: 0.15, sessionType: 'SETUP', responsiblePerson: 'Stall Management Team', resources: 'Tables & 16A Outlets', description: 'Mounting banners and hardware power checks.', venueSuffix: 'Exhibition Pavilion' },
        { activity: 'Inauguration & VIP Ribbon Cutting', weight: 0.10, sessionType: 'KEYNOTE', responsiblePerson: 'Principal & Industry Guests', resources: 'Stage Mic', description: 'Chief guest opening tour.', venueSuffix: 'Central Pavilion' },
        { activity: 'Round 1: Jury Stall Audits & Prototype Evaluation', weight: 0.35, sessionType: 'EVALUATION', responsiblePerson: 'Evaluation Panels (3 Teams)', resources: 'Digital Scoring App', description: '10-minute technical evaluation per stall.', venueSuffix: 'Stalls 1 to ' + numTeams },
        { activity: 'Lunch & Open Public Exhibition Viewing', weight: 0.15, sessionType: 'BREAK', responsiblePerson: 'Hospitality Leads', resources: 'Lunch Buffet', description: 'Lunch and general student viewing.', venueSuffix: 'Pavilion' },
        { activity: 'Round 2: Commercial Scalability & Impact Defense', weight: 0.15, sessionType: 'PARALLEL', responsiblePerson: 'Angel Investors & Senior Jury', resources: 'Investor Rubrics', description: 'Evaluating market readiness and IP novelty.', venueSuffix: 'Pitch Pods' },
        { activity: 'Innovation Awards & Seed Grant Announcements', weight: 0.10, sessionType: 'KEYNOTE', responsiblePerson: 'Incubation Cell Lead & Principal', resources: 'Trophies & Grants', description: 'Prize ceremony.', venueSuffix: 'Central Stage' },
      ],
    },

    'Robotics Challenge': {
      day1: [
        { activity: 'Pit Registration & Robot Technical Scrutineering', weight: 0.15, sessionType: 'SETUP', responsiblePerson: 'Technical Safety Officers', resources: 'Scales & Dimension Gauges', description: 'Safety, weight, and dimension check.', venueSuffix: 'Pit Zone' },
        { activity: 'Arena Calibration & Practice Time Trials', weight: 0.12, sessionType: 'MAIN', responsiblePerson: 'Arena Marshals', resources: 'Stopwatches', description: 'Track surface friction calibration.', venueSuffix: 'Primary Track' },
        { activity: 'Round 1: Qualifying Heats & Time Trials', weight: 0.33, sessionType: 'EVALUATION', responsiblePerson: 'Track Judges & Referees', resources: 'High-speed Cameras', description: 'Timed autonomous track runs.', venueSuffix: 'Arena Track A/B' },
        { activity: 'Pit Repair Lunch & Battery Charging Break', weight: 0.15, sessionType: 'BREAK', responsiblePerson: 'Support Volunteers', resources: 'Charging Stations', description: 'Battery recharging and crew lunch.', venueSuffix: 'Pit Area' },
        { activity: 'Grand Finals: Multi-Bot Arena Showdown', weight: 0.15, sessionType: 'MAIN', responsiblePerson: 'Grand Referees & Commentator', resources: 'Protective Shields', description: 'Final knockout rounds.', venueSuffix: 'Central Arena' },
        { activity: 'Robo-Master Championship Trophy Gala', weight: 0.10, sessionType: 'KEYNOTE', responsiblePerson: 'Chief Guest & Dean', resources: 'Trophies & Hardware Vouchers', description: 'Award distribution.', venueSuffix: 'Arena Podium' },
      ],
    },

    'Cultural Fest': {
      day1: [
        { activity: 'Green Room Check-in & Audio Sound Check', weight: 0.15, sessionType: 'SETUP', responsiblePerson: 'Stage Managers & Sound Engineer', resources: 'Mics & Line Arrays', description: 'Audio track loading and acoustic tuning.', venueSuffix: 'Green Rooms & Main Stage' },
        { activity: 'Fest Inauguration & Traditional Lamp Lighting', weight: 0.10, sessionType: 'KEYNOTE', responsiblePerson: 'Cultural Secretary & Dignitaries', resources: 'Traditional Lamp', description: 'Fest opening ceremony.', venueSuffix: 'Main Stage' },
        { activity: 'Segment 1: Solo Vocals & Classical Performances', weight: 0.30, sessionType: 'MAIN', responsiblePerson: 'Anchors & Music Jury', resources: 'Spotlights & Monitors', description: 'Vocal competitions with strict changeover buffers.', venueSuffix: 'Auditorium Stage' },
        { activity: 'Lunch & Flea Carnival Stalls', weight: 0.15, sessionType: 'BREAK', responsiblePerson: 'Student Council', resources: 'Food Stalls', description: 'Lunch and street plays.', venueSuffix: 'Fest Grounds' },
        { activity: 'Segment 2: Synchronized Group Dance & Drama', weight: 0.20, sessionType: 'MAIN', responsiblePerson: 'Dance Jury & Operations Lead', resources: 'Moving Head Lights & Smoke', description: 'Group dance competitions.', venueSuffix: 'Main Stage' },
        { activity: 'Star Night Gala & Trophy Handover', weight: 0.10, sessionType: 'KEYNOTE', responsiblePerson: 'Principal & Cultural President', resources: 'Rolling Trophies & Certificates', description: 'Celebrity guest address and department trophy.', venueSuffix: 'Open Air Stage' },
      ],
    },

    'Technical Quiz': {
      day1: [
        { activity: 'Quiz Team Check-in & Device Setup', weight: 0.12, sessionType: 'SETUP', responsiblePerson: 'Quiz Coordinators', resources: 'OMR Sheets & Clickers', description: 'Verification and seating.', venueSuffix: 'Lecture Hall 1' },
        { activity: 'Round 1: Written Eliminator Prelims (30 Questions)', weight: 0.28, sessionType: 'EVALUATION', responsiblePerson: 'Quiz Master & Invigilators', resources: 'Question Booklets', description: '30 tech trivia questions.', venueSuffix: 'Lecture Hall 1' },
        { activity: 'Score Tabulation & Audience Brain Teasers', weight: 0.15, sessionType: 'BUFFER', responsiblePerson: 'Assistant Quiz Master', resources: 'Spot Prizes & Projector', description: 'Audience spot prizes while finalists are tabulated.', venueSuffix: 'Main Stage' },
        { activity: 'Lunch Break', weight: 0.15, sessionType: 'BREAK', responsiblePerson: 'Hospitality Staff', resources: 'Cafeteria Dining', description: 'Lunch for participants and organizers.', venueSuffix: 'Cafeteria' },
        { activity: 'Round 2: Stage Finals (Audio-Visual & Rapid Buzzer)', weight: 0.20, sessionType: 'MAIN', responsiblePerson: 'Grand Quiz Master', resources: 'Hardware Buzzers & Dual Screens', description: 'Top 6 teams clash across 5 stage rounds.', venueSuffix: 'Main Stage' },
        { activity: 'Quiz Champion Felicitations & Prize Distribution', weight: 0.10, sessionType: 'KEYNOTE', responsiblePerson: 'HOD & Quiz Master', resources: 'Trophies & Books', description: 'Champion crowning.', venueSuffix: 'Main Stage' },
      ],
    },

    'Workshop & Bootcamp': {
      day1: [
        { activity: 'Learner Check-in & Lab Environment Setup', weight: 0.12, sessionType: 'SETUP', responsiblePerson: 'Teaching Assistants (4 Staff)', resources: 'Cloud Containers & Repo Clone', description: 'Attendance check-in and repo setup.', venueSuffix: 'Cloud Labs' },
        { activity: 'Session 1: Architectural Foundations & Concepts', weight: 0.28, sessionType: 'KEYNOTE', responsiblePerson: 'Lead Industry Instructor', resources: 'Live Coding Screen', description: 'Interactive architectural walkthrough.', venueSuffix: 'Seminar Hall' },
        { activity: 'Morning Tea & Quick Networking Pause', weight: 0.08, sessionType: 'BREAK', responsiblePerson: 'Hospitality Volunteers', resources: 'Tea & Snacks', description: 'Coffee recharge.', venueSuffix: 'Foyer' },
        { activity: 'Session 2: Hands-on Guided Lab Exercise', weight: 0.22, sessionType: 'MAIN', responsiblePerson: 'Instructor & TAs', resources: 'GPU Workstations', description: 'Guided implementation step-by-step.', venueSuffix: 'Cloud Labs' },
        { activity: 'Networking Lunch', weight: 0.12, sessionType: 'BREAK', responsiblePerson: 'Hospitality Team', resources: 'Lunch Buffet', description: 'Lunch break and informal Q&A.', venueSuffix: 'Dining Center' },
        { activity: 'Session 3: Capstone Build & Q&A Assessment', weight: 0.10, sessionType: 'MAIN', responsiblePerson: 'Lead Speaker', resources: 'Benchmark Suite', description: 'Deploying end-to-end solutions.', venueSuffix: 'Cloud Labs' },
        { activity: 'Valedictory & Verified Digital Certificate Handout', weight: 0.08, sessionType: 'KEYNOTE', responsiblePerson: 'HOD & Speaker', resources: 'Certificates with QR', description: 'Skill badges and certificate handout.', venueSuffix: 'Seminar Hall' },
      ],
    },
  };

  const selectedTemplate = templatesByEventType[eventType] || templatesByEventType['Hackathon'];
  const day1Templates = selectedTemplate.day1;
  const day2Templates = isMultiDay && selectedTemplate.day2 ? selectedTemplate.day2 : null;

  const totalAvailableMins = Math.max(90, endMins - startMins);

  const generateDayItems = (templates: ActivityTemplate[], dayTag: string): AgendaItem[] => {
    let currentCursor = startMins;
    const totalWeight = templates.reduce((acc, t) => acc + t.weight, 0);

    return templates.map((tmpl, idx) => {
      const isLast = idx === templates.length - 1;
      let slotMins: number;

      if (isLast) {
        slotMins = endMins - currentCursor;
      } else {
        const rawMins = Math.round((tmpl.weight / totalWeight) * totalAvailableMins);
        // Round to nearest 5 minutes for clean human schedule
        slotMins = Math.max(15, Math.round(rawMins / 5) * 5);
        if (currentCursor + slotMins > endMins - 15) {
          slotMins = endMins - currentCursor;
        }
      }

      const slotStart = currentCursor;
      const slotEnd = isLast ? endMins : Math.min(endMins, currentCursor + slotMins);
      currentCursor = slotEnd;

      const durationMinutes = Math.max(5, slotEnd - slotStart);

      return {
        id: `ag_${dayTag.toLowerCase()}_${idx + 1}`,
        day: dayTag,
        time: `${formatMinutesToTime(slotStart)} - ${formatMinutesToTime(slotEnd)}`,
        duration: `${durationMinutes} mins`,
        activity: tmpl.activity,
        venue: tmpl.venueSuffix ? `${venue} (${tmpl.venueSuffix})` : venue,
        responsiblePerson: tmpl.responsiblePerson,
        participants: 'All Registered Participants',
        resources: tmpl.resources,
        sessionType: tmpl.sessionType,
        description: tmpl.description,
        status: 'PENDING',
      };
    });
  };

  const day1Agenda = generateDayItems(day1Templates, 'DAY 1');
  const day2Agenda = day2Templates ? generateDayItems(day2Templates, 'DAY 2') : [];

  return [...day1Agenda, ...day2Agenda];
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
