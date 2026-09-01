export type UserRole = 'ORGANISER' | 'VOLUNTEER' | 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  phone?: string;
  studentRollNo?: string;
  volunteerId?: string;
  year?: string;
  section?: string;
  adminId?: string;
  isApproved?: boolean;
  isActive?: boolean;
  createdAt: string;
  password?: string;
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED';

export type EventType = 
  | 'Hackathon' 
  | 'Paper Presentation' 
  | 'Coding Contest' 
  | 'Project Expo' 
  | 'Robotics Challenge' 
  | 'Cultural Fest' 
  | 'Technical Quiz' 
  | 'Workshop & Bootcamp';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'number' | 'radio' | 'file';
  placeholder?: string;
  required: boolean;
  options?: string[];
  helpText?: string;
  defaultValue?: string;
}

export interface IntelligenceReport {
  readinessScore: number;
  timeEfficiency: number;
  resourceUtilization: number;
  participantExperience: number;
  operationalFeasibility: number;
  risks: string[];
  recommendations: string[];
  feasibilityAnalysis?: string;
  parallelSessionsCount?: number;
  breaksIncluded?: boolean;
  conflictsResolved?: string[];
}

export interface AgendaItem {
  id: string;
  time: string;
  activity: string;
  venue: string;
  responsiblePerson: string;
  description?: string;
  duration?: string;
  day?: string;
  participants?: string;
  resources?: string;
  sessionType?: 'MAIN' | 'PARALLEL' | 'BREAK' | 'SETUP' | 'BUFFER' | 'EVALUATION' | 'KEYNOTE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface PanelMember {
  id: string;
  name: string;
  email: string;
  department: string;
  assignedRoom: string;
  expertise: string;
}

export interface PanelAllocation {
  id: string;
  eventId: string;
  teamId: string;
  teamName: string;
  leadStudentName: string;
  leadRollNo: string;
  panelId: string;
  panelName: string;
  room: string;
  timeSlot: string;
  roundNumber: number;
  score?: number;
  maxScore?: number;
  feedback?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABSENT';
}

export type VolunteerRoleType = 
  | 'Registration Desk'
  | 'Attendance & QR Verification'
  | 'Room & Lab Management'
  | 'Student Guidance & Ushering'
  | 'Panel & Jury Coordination'
  | 'Time Management & Bell'
  | 'Certificate Distribution'
  | 'Registration Desk Coordinator'
  | 'QR Attendance Scanner'
  | 'Lab / Room Logistics Lead'
  | 'Jury Panel Coordination'
  | 'Student Guidance & Helpdesk'
  | 'Stage & Certificate Distribution'
  | 'Time Keeper & Stage Manager';

export interface VolunteerAssignment {
  id: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  volunteerPhone?: string;
  role: VolunteerRoleType;
  location: string;
  assignedLocation?: string;
  timeSlot: string;
  status: 'ASSIGNED' | 'CHECKED_IN' | 'COMPLETED';
  notes?: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'WITHDRAWN' | 'REPLACED';

export interface TeamMember {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone?: string;
  department?: string;
  year?: string;
  section?: string;
  isLead?: boolean;
  attendanceStatus: AttendanceStatus;
  attendanceTimestamp?: string;
  attendanceNotes?: string;
  isActive: boolean; // false if REPLACED or WITHDRAWN
  replacementInfo?: {
    replacedByMemberId?: string;
    replacedByName?: string;
    replacedByEmail?: string;
    replacedAt: string;
    replacedByActorName: string;
    replacedByActorRole: string;
    reason: string;
  };
  isReplacementMember?: boolean;
  replacedOriginalMemberName?: string;
  replacedOriginalMemberRoll?: string;
}

export interface MemberReplacementRecord {
  id: string;
  registrationId: string;
  eventId: string;
  teamName: string;
  originalMember: {
    id: string;
    name: string;
    rollNumber: string;
    email: string;
    phone?: string;
    department?: string;
  };
  newMember: {
    id: string;
    name: string;
    rollNumber: string;
    email: string;
    phone?: string;
    department?: string;
    year?: string;
    section?: string;
  };
  replacedAt: string;
  replacedByActorName: string;
  replacedByActorRole: string;
  reason: string;
}

export interface AttendanceSession {
  id: string;
  name: string;
  timeSlot: string;
  isCurrent: boolean;
  isCompleted: boolean;
  finalizedAt?: string;
  finalizedBy?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  section: string;
  college: string;
  teamName?: string;
  teamMembers?: string[];
  membersList?: TeamMember[];
  customResponses: Record<string, any>;
  registeredAt: string;
  status: 'CONFIRMED' | 'PENDING' | 'REJECTED';
  activeStatus?: 'ACTIVE' | 'WITHDRAWN' | 'DISQUALIFIED' | 'REPLACED';
  overallAttendancePercentage?: number;
  teamEligibility?: 'ELIGIBLE' | 'INCOMPLETE_TEAM' | 'DISQUALIFIED_ABSENT' | 'SOLO_PARTICIPANT';
  replacementHistory?: MemberReplacementRecord[];
  qrCodeData: string;
  attendance?: {
    attended: boolean;
    timestamp?: string;
    volunteerId?: string;
    volunteerName?: string;
    arrivalStatus: 'ON_TIME' | 'LATE';
    status?: AttendanceStatus;
  };
  roundTracking: {
    registered: boolean;
    attended: boolean;
    round1Completed: boolean;
    round2Completed: boolean;
    finalPresentation: boolean;
    participated: boolean;
    winnerStatus: 'NONE' | 'WINNER' | 'RUNNER_UP_1' | 'RUNNER_UP_2' | 'SPECIAL_MENTION';
  };
  certificateId?: string;
  certificateStatus?: 'NOT_ELIGIBLE' | 'ELIGIBLE' | 'GENERATED' | 'SENT' | 'DELIVERED';
}

export interface CandidateBatchUploadItem {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  department?: string;
  role: 'PARTICIPANT' | 'WINNER' | 'RUNNER_UP' | 'VOLUNTEER';
  positionTitle?: string;
  customFileName?: string;
  customFileUrl?: string;
  customFileSize?: string;
  status: 'PENDING' | 'SENDING' | 'DELIVERED' | 'FAILED';
  error?: string;
  certId?: string;
}

export interface EmailDispatchConfig {
  subject: string;
  senderName: string;
  senderEmail: string;
  bodyText: string;
  attachPdf: boolean;
  attachQrCode: boolean;
  includeVerificationLink: boolean;
  customSignature?: string;
}

export interface CertificateEligibilityRules {
  requireRegistration: boolean;
  requireAttendance: boolean;
  requireRound1: boolean;
  requireRound2: boolean;
  requireFinalPresentation: boolean;
  minAttendancePercentage?: number;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  theme: 'classic-gold' | 'tech-blue' | 'modern-emerald' | 'crimson-prestige';
  signatoryName: string;
  signatoryTitle: string;
  signatoryDepartment: string;
  collegeName: string;
  collegeLogoText: string;
  borderStyle: 'ornate' | 'minimal' | 'modern-tech';
  customLogoUrl?: string;
  customSignatureUrl?: string;
}

export interface Certificate {
  id: string;
  certificateId: string; // e.g. "CERT-AI-2026-8812"
  eventId: string;
  eventTitle: string;
  eventDate: string;
  recipientId: string;
  recipientName: string;
  recipientRollNo: string;
  recipientDept: string;
  recipientEmail: string;
  recipientRole: 'PARTICIPANT' | 'WINNER' | 'RUNNER_UP' | 'VOLUNTEER';
  positionTitle?: string;
  issueDate: string;
  templateStyle: CertificateTemplate;
  status: 'PENDING' | 'GENERATED' | 'SENT' | 'DELIVERED' | 'FAILED';
  verificationUrl: string;
  qrData: string;
  sentAt?: string;
  customFileName?: string;
  customFileUrl?: string;
  emailSubject?: string;
  deliveryReceiptId?: string;
}

export interface EventItem {
  id: string;
  title: string;
  type: EventType;
  description: string;
  date: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  venue: string;
  maxStudents: number;
  maxTeams: number;
  teamSizeMin: number;
  teamSizeMax: number;
  registrationDeadline: string;
  coordinatorName: string;
  organizingDepartment: string;
  contactEmail: string;
  contactNumber: string;
  numRounds: number;
  numPanels: number;
  rules: string;
  eligibilityCriteria: string;
  status: EventStatus;
  createdAt: string;
  organizerId: string;
  
  // AI & Workflow sub-modules
  registrationForm: FormField[];
  agenda: AgendaItem[];
  panels: PanelMember[];
  allocations: PanelAllocation[];
  volunteerAssignments: VolunteerAssignment[];
  eligibilityRules: CertificateEligibilityRules;
  certificateTemplate: CertificateTemplate;
  resultsPublished: boolean;
  isRosterFinalized?: boolean;
  rosterFinalizedAt?: string;
  rosterFinalizedBy?: string;
  attendanceSessions?: AttendanceSession[];
  intelligenceReport?: IntelligenceReport;
  eventConfig?: Record<string, any>;
  isMultiDay?: boolean;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  targetRole?: UserRole | 'ALL';
  eventId?: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'CERTIFICATE';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  category: 'EVENT' | 'AUTH' | 'ATTENDANCE' | 'ALLOCATION' | 'CERTIFICATE' | 'ADMIN';
}

export interface AIEventInsight {
  eventId: string;
  generatedAt: string;
  attendanceRate: number;
  roundRetentionRate: number;
  topDepartments: { dept: string; count: number }[];
  keyHighlights: string[];
  actionableRecommendations: string[];
  bottlenecksIdentified: string[];
  panelWorkloadSummary: { panelName: string; teamCount: number; loadStatus: 'BALANCED' | 'HEAVY' | 'LIGHT' }[];
}
