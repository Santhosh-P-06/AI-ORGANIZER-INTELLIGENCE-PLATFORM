'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  EventItem,
  Registration,
  Certificate,
  AuditLog,
  NotificationItem,
  FormField,
  AgendaItem,
  PanelAllocation,
  VolunteerAssignment,
  CertificateTemplate,
  CandidateBatchUploadItem,
  EmailDispatchConfig,
  AttendanceStatus,
  TeamMember,
  MemberReplacementRecord,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_CERTIFICATES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole;
  users: User[];
  events: EventItem[];
  registrations: Registration[];
  certificates: Certificate[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  activeEventId: string;
  setActiveEventId: (id: string) => void;
  
  // Auth & Role
  login: (emailOrId: string, role: UserRole, password?: string) => boolean;
  registerUser: (userData: { name: string; email: string; password: string; role: UserRole }) => { success: boolean; message: string };
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  
  // Events
  createEvent: (eventData: Partial<EventItem>) => EventItem;
  updateEvent: (id: string, updates: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  updateEventForm: (eventId: string, fields: FormField[]) => void;
  updateEventAgenda: (eventId: string, agenda: AgendaItem[]) => void;
  updateEventPanels: (eventId: string, panels: any[]) => void;
  updateEventAllocations: (eventId: string, allocations: PanelAllocation[]) => void;
  updateVolunteerAssignments: (eventId: string, assignments: VolunteerAssignment[]) => void;
  updateCertificateTemplate: (eventId: string, template: CertificateTemplate) => void;
  
  // Registrations & Dynamic Data
  registerStudent: (eventId: string, studentData: any, customResponses: Record<string, any>) => { success: boolean; message: string; registration?: Registration };
  updateRegistrationStatus: (regId: string, status: 'CONFIRMED' | 'PENDING' | 'REJECTED') => void;
  addDemoRegistration: (eventId: string) => Registration;
  
  // Attendance & Active Roster Operations
  recordQRAttendance: (eventId: string, qrDataOrRoll: string, volunteer: User) => { success: boolean; message: string; registration?: Registration };
  recordManualAttendance: (regId: string, attended: boolean, volunteerName: string) => void;
  markParticipantAttendance: (regId: string, status: AttendanceStatus, memberId?: string, notes?: string) => void;
  replaceTeamMember: (
    regId: string,
    originalMemberId: string,
    newMember: {
      name: string;
      rollNumber: string;
      email: string;
      phone?: string;
      department?: string;
      year?: string;
      section?: string;
    },
    reason: string
  ) => { success: boolean; message: string };
  finalizeActiveRoster: (eventId: string) => { success: boolean; message: string; activeCount: number; incompleteCount: number };
  unfinalizeActiveRoster: (eventId: string) => void;
  sendAbsenceAlerts: (eventId: string) => { sentCount: number; message: string };
  
  // Rounds & Results
  updateRoundTracking: (regId: string, roundField: string, value: boolean) => void;
  setTeamWinnerStatus: (regId: string, status: 'NONE' | 'WINNER' | 'RUNNER_UP_1' | 'RUNNER_UP_2' | 'SPECIAL_MENTION') => void;
  publishEventResults: (eventId: string) => void;
  
  // Certificates
  evaluateAndGenerateCertificates: (eventId: string) => { generatedCount: number; eligibleCount: number };
  sendSingleCertificateEmail: (certId: string) => Promise<boolean>;
  sendAllEligibleCertificates: (eventId: string) => Promise<{ sentCount: number }>;
  getCertificateById: (certId: string) => Certificate | undefined;
  uploadAndDispatchCertificates: (
    eventId: string,
    candidates: CandidateBatchUploadItem[],
    emailConfig: EmailDispatchConfig,
    onProgress?: (current: number, total: number, candidate: CandidateBatchUploadItem) => void
  ) => Promise<{ success: boolean; sentCount: number; failedCount: number }>;
  addManualCertificate: (certData: Partial<Certificate> & { eventId: string; recipientName: string; recipientEmail: string }) => Certificate;
  deleteCertificate: (certId: string) => boolean;
  reissueCertificate: (certId: string) => boolean;
  
  // Admin & Audit
  toggleUserApproval: (userId: string) => void;
  toggleUserActive: (userId: string) => void;
  addUser: (userData: Partial<User>) => void;
  addAuditLog: (action: string, details: string, category: AuditLog['category']) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const saved = window.localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or fallback to defaults
  const [users, setUsers] = useState<User[]>(() => {
    return readStoredValue('ai_event_users', INITIAL_USERS);
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return readStoredValue('ai_event_current_user', null);
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    return readStoredValue('ai_event_events', INITIAL_EVENTS);
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    return readStoredValue('ai_event_registrations', INITIAL_REGISTRATIONS);
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    return readStoredValue('ai_event_certificates', INITIAL_CERTIFICATES);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return readStoredValue('ai_event_audit_logs', INITIAL_AUDIT_LOGS);
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return readStoredValue('ai_event_notifications', INITIAL_NOTIFICATIONS);
  });

  const [activeEventId, setActiveEventId] = useState<string>('evt_technohack_2026');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ai_event_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ai_event_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ai_event_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('ai_event_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('ai_event_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('ai_event_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('ai_event_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const currentRole: UserRole = currentUser?.role || 'ORGANISER';

  // Audit Logger Helper
  const addAuditLog = (action: string, details: string, category: AuditLog['category']) => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser?.id || 'sys',
      actorName: currentUser?.name || 'System Operator',
      actorRole: currentRole,
      action,
      details,
      category,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth Functions
  const login = (emailOrId: string, role: UserRole, password?: string): boolean => {
    const found = users.find(
      u => (u.email.toLowerCase() === emailOrId.toLowerCase() || 
            u.studentRollNo?.toLowerCase() === emailOrId.toLowerCase() || 
            u.adminId?.toLowerCase() === emailOrId.toLowerCase()) && 
           u.role === role
    );

    if (found && (found.password ? found.password === password : password === 'password123')) {
      setCurrentUser(found);
      addAuditLog(`User Authenticated as ${role}`, `Logged in with identifier: ${emailOrId}`, 'AUTH');
      return true;
    }

    return false;
  };

  const registerUser = (userData: { name: string; email: string; password: string; role: UserRole }) => {
    const email = userData.email.trim().toLowerCase();
    if (users.some(user => user.email.toLowerCase() === email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name.trim(),
      email,
      password: userData.password,
      role: userData.role,
      department: 'Not specified',
      isApproved: userData.role !== 'ORGANISER',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setUsers(previous => [...previous, newUser]);
    setCurrentUser(newUser);
    addAuditLog('Account Created', `New ${userData.role.toLowerCase()} account created for ${newUser.email}`, 'AUTH');
    return { success: true, message: 'Account created successfully.' };
  };

  const switchDemoRole = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      addAuditLog(`Role Switched to ${role}`, `Active identity: ${user.name} (${user.department})`, 'AUTH');
    }
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('User Logged Out', `Session ended for ${currentUser.name}`, 'AUTH');
    }
    setCurrentUser(null);
  };

  // Events
  const createEvent = (eventData: Partial<EventItem>): EventItem => {
    const newEvent: EventItem = {
      id: `evt_${Date.now()}`,
      title: eventData.title || 'Untitled Event',
      type: eventData.type || 'Hackathon',
      description: eventData.description || 'Collegiate innovation event.',
      date: eventData.date || new Date().toISOString().split('T')[0],
      endDate: eventData.endDate || eventData.date || new Date().toISOString().split('T')[0],
      startTime: eventData.startTime || '09:00 AM',
      endTime: eventData.endTime || '05:00 PM',
      venue: eventData.venue || 'Campus Auditorium',
      maxStudents: Number(eventData.maxStudents) || 100,
      maxTeams: Number(eventData.maxTeams) || 25,
      teamSizeMin: Number(eventData.teamSizeMin) || 1,
      teamSizeMax: Number(eventData.teamSizeMax) || 4,
      registrationDeadline: eventData.registrationDeadline || new Date().toISOString(),
      coordinatorName: eventData.coordinatorName || currentUser?.name || 'Prof. Coordinator',
      organizingDepartment: eventData.organizingDepartment || currentUser?.department || 'Computer Science & Engineering',
      contactEmail: eventData.contactEmail || currentUser?.email || 'events@college.edu',
      contactNumber: eventData.contactNumber || '+91 98450 00000',
      numRounds: Number(eventData.numRounds) || 2,
      numPanels: Number(eventData.numPanels) || 3,
      rules: eventData.rules || 'Standard code of conduct applies.',
      eligibilityCriteria: eventData.eligibilityCriteria || 'Open to all enrolled students.',
      status: eventData.status || 'PUBLISHED',
      createdAt: new Date().toISOString(),
      organizerId: currentUser?.id || 'user_org_1',
      resultsPublished: false,
      registrationForm: eventData.registrationForm || [
        { id: 'f_name', label: 'Full Student Name', type: 'text', placeholder: 'e.g. Alex Morgan', required: true },
        { id: 'f_roll', label: 'Roll Number', type: 'text', placeholder: 'e.g. 21CS084', required: true },
        { id: 'f_email', label: 'College Email ID', type: 'email', placeholder: 'alex@college.edu', required: true },
        { id: 'f_dept', label: 'Department', type: 'select', required: true, options: ['Computer Science', 'Information Tech', 'AI & DS', 'ECE', 'Mechanical'] },
      ],
      agenda: eventData.agenda || [],
      panels: eventData.panels || [
        { id: 'pnl_1', name: 'Panel 1 (Track A)', email: 'panel1@college.edu', department: 'Computer Science', assignedRoom: 'Room 101', expertise: 'Technical Architecture' },
        { id: 'pnl_2', name: 'Panel 2 (Track B)', email: 'panel2@college.edu', department: 'Information Tech', assignedRoom: 'Room 102', expertise: 'Innovation & Scalability' },
      ],
      allocations: eventData.allocations || [],
      volunteerAssignments: eventData.volunteerAssignments || [],
      eligibilityRules: eventData.eligibilityRules || {
        requireRegistration: true,
        requireAttendance: true,
        requireRound1: true,
        requireRound2: true,
        requireFinalPresentation: true,
        minAttendancePercentage: 100,
      },
      certificateTemplate: eventData.certificateTemplate || {
        id: `tmpl_${Date.now()}`,
        name: `${eventData.title || 'Event'} Official Template`,
        theme: 'classic-gold',
        signatoryName: `${eventData.coordinatorName || 'Prof. Coordinator'} & Dr. Arthur Vance`,
        signatoryTitle: 'Event Convener & Dean of Academics',
        signatoryDepartment: eventData.organizingDepartment || 'Dept of Computer Science',
        collegeName: 'National Institute of Engineering & Technology',
        collegeLogoText: 'NIET • AI EVENT OPERATING SYSTEM',
        borderStyle: 'ornate',
      },
    };

    setEvents(prev => [newEvent, ...prev]);
    setActiveEventId(newEvent.id);
    addAuditLog('New Event Created', `Created "${newEvent.title}" (${newEvent.type})`, 'EVENT');
    
    // Broadcast notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      targetRole: 'ALL',
      eventId: newEvent.id,
      title: `New Event Announced: ${newEvent.title}`,
      message: `Registrations are now live for ${newEvent.title}. Venue: ${newEvent.venue}.`,
      type: 'INFO',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);

    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<EventItem>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    addAuditLog('Event Configuration Updated', `Modified event parameters for event ID ${id}`, 'EVENT');
  };

  const deleteEvent = (id: string) => {
    const target = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    addAuditLog('Event Deleted', `Removed event "${target?.title || id}"`, 'EVENT');
  };

  const updateEventForm = (eventId: string, fields: FormField[]) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, registrationForm: fields } : e));
    addAuditLog('Registration Form Updated', `Updated schema fields for event ${eventId}`, 'EVENT');
  };

  const updateEventAgenda = (eventId: string, agenda: AgendaItem[]) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, agenda } : e));
    addAuditLog('Event Agenda Updated', `Synchronized ${agenda.length} agenda timeline slots`, 'EVENT');
  };

  const updateEventPanels = (eventId: string, panels: any[]) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, panels } : e));
  };

  const updateEventAllocations = (eventId: string, allocations: PanelAllocation[]) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, allocations } : e));
    addAuditLog('Panel Allocation Published', `Allocated ${allocations.length} evaluation slots`, 'ALLOCATION');

    // Notify students
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      targetRole: 'STUDENT',
      eventId,
      title: 'Panel Evaluation Schedule Released',
      message: 'Your jury panel, room, and presentation time slot have been officially scheduled.',
      type: 'INFO',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const updateVolunteerAssignments = (eventId: string, assignments: VolunteerAssignment[]) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, volunteerAssignments: assignments } : e));
    addAuditLog('Volunteer Roster Updated', `Assigned ${assignments.length} duty locations`, 'EVENT');
  };

  const updateCertificateTemplate = (eventId: string, template: CertificateTemplate) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, certificateTemplate: template } : e));
    addAuditLog('Certificate Template Updated', `Updated visual layout to theme: ${template.theme}`, 'CERTIFICATE');
  };

  // Student Registration
  const registerStudent = (eventId: string, studentData: any, customResponses: Record<string, any>) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return { success: false, message: 'Event not found.' };

    const eventRegs = registrations.filter(r => r.eventId === eventId);
    if (eventRegs.length >= targetEvent.maxStudents) {
      return { success: false, message: 'Registration capacity reached. Registrations are currently closed.' };
    }

    // Extract roll number dynamically
    const rollNo = studentData.rollNumber || 
      customResponses?.f_roll || 
      customResponses?.rollNumber || 
      customResponses?.roll_number || 
      currentUser?.studentRollNo || 
      `STU_${Math.floor(1000 + Math.random() * 9000)}`;

    const duplicate = eventRegs.find(r => r.rollNumber?.toLowerCase() === rollNo.toLowerCase());
    if (duplicate) {
      return { success: false, message: `Roll number ${rollNo} is already registered for this event.` };
    }

    const studentName = studentData.studentName || customResponses?.f_name || customResponses?.name || currentUser?.name || 'Registered Student';
    const email = studentData.email || customResponses?.f_email || customResponses?.email || currentUser?.email || 'student@college.edu';
    const phone = studentData.phone || customResponses?.f_phone || customResponses?.phone || currentUser?.phone || '+91 99000 11223';
    const department = studentData.department || customResponses?.f_dept || customResponses?.department || currentUser?.department || 'Computer Science & Engineering';
    const year = studentData.year || customResponses?.f_year || customResponses?.year || currentUser?.year || '1st Year';
    const section = studentData.section || customResponses?.f_section || customResponses?.section || currentUser?.section || 'Sec-A';
    const teamName = studentData.teamName || customResponses?.f_team_name || customResponses?.teamName;

    const regId = `reg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const parsedRawMembers = studentData.teamMembers || (customResponses.f_team_members ? String(customResponses.f_team_members).split('\n').map((s: string) => s.trim()).filter(Boolean) : []);
    
    const leadMember: TeamMember = {
      id: `mem_lead_${regId}`,
      name: studentName,
      rollNumber: rollNo,
      email: email,
      phone: phone,
      department: department,
      year: year,
      section: section,
      isLead: true,
      attendanceStatus: 'ABSENT',
      isActive: true,
    };

    const squadMembers: TeamMember[] = parsedRawMembers.map((mStr: string, idx: number) => ({
      id: `mem_${regId}_${idx + 1}`,
      name: mStr,
      rollNumber: `${rollNo}-M${idx + 1}`,
      email: `member${idx + 1}_${rollNo.toLowerCase()}@college.edu`,
      department: department,
      year: year,
      section: section,
      isLead: false,
      attendanceStatus: 'ABSENT',
      isActive: true,
    }));

    const finalMembersList: TeamMember[] = [leadMember, ...squadMembers];

    const newReg: Registration = {
      id: regId,
      eventId,
      studentId: currentUser?.id || `stu_${Date.now()}`,
      studentName: studentName,
      rollNumber: rollNo,
      email: email,
      phone: phone,
      department: department,
      year: year,
      section: section,
      college: studentData.college || 'National Institute of Engineering & Technology',
      teamName: teamName,
      teamMembers: studentData.teamMembers || (customResponses.f_team_members ? customResponses.f_team_members.split('\n') : undefined),
      membersList: finalMembersList,
      customResponses,
      registeredAt: new Date().toISOString(),
      status: 'CONFIRMED',
      qrCodeData: `NIET:EVT:${eventId}:STU:${rollNo}:REG:${regId}`,
      attendance: {
        attended: false,
        arrivalStatus: 'ON_TIME',
        status: 'ABSENT',
      },
      roundTracking: {
        registered: true,
        attended: false,
        round1Completed: false,
        round2Completed: false,
        finalPresentation: false,
        participated: false,
        winnerStatus: 'NONE',
      },
      certificateStatus: 'NOT_ELIGIBLE',
      teamEligibility: finalMembersList.length >= (targetEvent.teamSizeMin || 1) ? 'ELIGIBLE' : 'INCOMPLETE_TEAM',
    };

    setRegistrations(prev => [newReg, ...prev]);
    addAuditLog('Student Registration', `Student ${newReg.studentName} (${newReg.rollNumber}) registered for ${targetEvent.title}`, 'EVENT');

    // Notify student
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: newReg.studentId,
      targetRole: 'STUDENT',
      eventId,
      title: 'Registration Confirmed ✅',
      message: `You are registered for ${targetEvent.title}. Your QR check-in pass is ready in My Events.`,
      type: 'SUCCESS',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: 'Registration successfully completed! Check-in pass generated.', registration: newReg };
  };

  const updateRegistrationStatus = (regId: string, status: 'CONFIRMED' | 'PENDING' | 'REJECTED') => {
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status } : r));
    addAuditLog('Registration Status Changed', `Set status to ${status} for reg ID ${regId}`, 'EVENT');
  };

  // QR Attendance Scanning
  const recordQRAttendance = (eventId: string, qrDataOrRoll: string, volunteer: User) => {
    const cleanInput = qrDataOrRoll.trim().toLowerCase();
    
    // Find matching registration
    const reg = registrations.find(r => 
      r.eventId === eventId && (
        r.qrCodeData.toLowerCase().includes(cleanInput) ||
        r.rollNumber.toLowerCase() === cleanInput ||
        r.email.toLowerCase() === cleanInput ||
        r.id.toLowerCase() === cleanInput
      )
    );

    if (!reg) {
      return { success: false, message: `No active registration found for "${qrDataOrRoll}" in this event.` };
    }

    if (reg.attendance?.attended) {
      return { 
        success: true, 
        message: `⚠️ Student ${reg.studentName} (${reg.rollNumber}) is ALREADY checked in at ${new Date(reg.attendance.timestamp!).toLocaleTimeString()}.`,
        registration: reg 
      };
    }

    const now = new Date().toISOString();
    const updatedReg: Registration = {
      ...reg,
      attendance: {
        attended: true,
        timestamp: now,
        volunteerId: volunteer.id,
        volunteerName: volunteer.name,
        arrivalStatus: 'ON_TIME',
      },
      roundTracking: {
        ...reg.roundTracking,
        attended: true,
        participated: true,
      },
      certificateStatus: 'ELIGIBLE',
    };

    setRegistrations(prev => prev.map(r => r.id === reg.id ? updatedReg : r));
    addAuditLog('QR Attendance Verified', `Volunteer ${volunteer.name} checked in ${reg.studentName} (${reg.rollNumber})`, 'ATTENDANCE');

    return { 
      success: true, 
      message: `✅ Check-in Success! ${reg.studentName} (${reg.rollNumber}) verified. Team: ${reg.teamName || 'Individual'}.`,
      registration: updatedReg 
    };
  };

  const recordManualAttendance = (regId: string, attended: boolean, volunteerName: string) => {
    setRegistrations(prev => prev.map(r => {
      if (r.id !== regId) return r;
      return {
        ...r,
        attendance: {
          attended,
          timestamp: attended ? new Date().toISOString() : undefined,
          volunteerName,
          arrivalStatus: 'ON_TIME',
        },
        roundTracking: {
          ...r.roundTracking,
          attended,
          participated: attended,
        },
        certificateStatus: attended ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
      };
    }));
    addAuditLog('Manual Attendance Toggled', `Marked reg ${regId} as ${attended ? 'Present' : 'Absent'}`, 'ATTENDANCE');
  };


  const addDemoRegistration = (eventId: string): Registration => {
    const newRegistration: Registration = {
      id: `reg_demo_${Date.now()}`,
      eventId,
      studentId: `stu_demo_${Date.now()}`,
      studentName: 'Demo Student',
      rollNumber: `DEMO${Math.floor(1000 + Math.random() * 9000)}`,
      email: 'demo.student@college.edu',
      phone: '+91 90000 00000',
      department: 'Computer Science & Engineering',
      year: '3rd Year (Junior)',
      section: 'Sec-A',
      college: 'National Institute of Engineering & Technology',
      teamName: 'Demo Team',
      customResponses: {},
      registeredAt: new Date().toISOString(),
      status: 'CONFIRMED',
      qrCodeData: `NIET:EVT:${eventId}:DEMO:${Date.now()}`,
      attendance: { attended: false, arrivalStatus: 'ON_TIME' },
      roundTracking: {
        registered: true,
        attended: false,
        round1Completed: false,
        round2Completed: false,
        finalPresentation: false,
        participated: false,
        winnerStatus: 'NONE',
      },
      certificateStatus: 'NOT_ELIGIBLE',
    };
    setRegistrations(prev => [newRegistration, ...prev]);
    addAuditLog('Demo Registration Added', `Added demo registration for event ${eventId}`, 'EVENT');
    return newRegistration;
  };

  const markParticipantAttendance = (regId: string, status: AttendanceStatus, memberId?: string, notes?: string) => {
    const attended = status === 'PRESENT' || status === 'LATE';
    setRegistrations(prev => prev.map(registration => {
      if (registration.id !== regId) return registration;
      
      const targetEvent = events.find(e => e.id === registration.eventId);
      const minTeamSize = targetEvent?.teamSizeMin || 1;

      // Update membersList if memberId provided, or update all active members if no memberId
      let updatedMembers = registration.membersList;
      if (updatedMembers && updatedMembers.length > 0) {
        if (memberId) {
          updatedMembers = updatedMembers.map(member => {
            if (member.id === memberId) {
              return {
                ...member,
                attendanceStatus: status,
                attendanceNotes: notes || member.attendanceNotes,
                attendanceTimestamp: attended ? new Date().toISOString() : member.attendanceTimestamp,
                isActive: status !== 'REPLACED' && status !== 'WITHDRAWN',
              };
            }
            return member;
          });
        } else {
          updatedMembers = updatedMembers.map(member => {
            if (member.attendanceStatus === 'REPLACED') return member; // keep replaced status intact
            return {
              ...member,
              attendanceStatus: status,
              attendanceNotes: notes || member.attendanceNotes,
              attendanceTimestamp: attended ? new Date().toISOString() : member.attendanceTimestamp,
              isActive: status !== 'REPLACED' && status !== 'WITHDRAWN',
            };
          });
        }
      }

      // Compute team statistics
      const activeMembers = updatedMembers ? updatedMembers.filter(m => m.attendanceStatus !== 'REPLACED' && m.attendanceStatus !== 'WITHDRAWN') : [];
      const presentMembers = activeMembers.filter(m => m.attendanceStatus === 'PRESENT' || m.attendanceStatus === 'LATE');
      const attendancePercent = activeMembers.length > 0
        ? Math.round((presentMembers.length / activeMembers.length) * 100)
        : (attended ? 100 : 0);

      // Determine team eligibility
      let eligibility: Registration['teamEligibility'] = 'ELIGIBLE';
      if (activeMembers.length > 1) {
        if (presentMembers.length >= minTeamSize) {
          eligibility = 'ELIGIBLE';
        } else if (presentMembers.length > 0 && presentMembers.length < minTeamSize) {
          eligibility = 'INCOMPLETE_TEAM';
        } else {
          eligibility = 'DISQUALIFIED_ABSENT';
        }
      } else {
        eligibility = attended ? 'ELIGIBLE' : 'DISQUALIFIED_ABSENT';
      }

      // If at least one member is present/late, overall registration is considered attended
      const hasAnyPresent = updatedMembers && updatedMembers.length > 0
        ? presentMembers.length > 0
        : attended;

      const actorName = currentUser?.name || 'Staff';
      const actorRole = currentRole;

      return {
        ...registration,
        membersList: updatedMembers,
        overallAttendancePercentage: attendancePercent,
        teamEligibility: eligibility,
        attendance: {
          attended: hasAnyPresent,
          timestamp: hasAnyPresent ? (registration.attendance?.timestamp || new Date().toISOString()) : undefined,
          volunteerId: currentUser?.id,
          volunteerName: `${actorName} (${actorRole})`,
          arrivalStatus: status === 'LATE' ? 'LATE' : 'ON_TIME',
          status,
        },
        roundTracking: {
          ...registration.roundTracking,
          attended: hasAnyPresent,
          participated: hasAnyPresent || registration.roundTracking.participated,
        },
        certificateStatus: hasAnyPresent && attendancePercent >= 75 ? 'ELIGIBLE' : 'NOT_ELIGIBLE',
      };
    }));

    addAuditLog(
      'Participant Attendance Updated',
      `Marked ${status} for registration ${regId}${memberId ? ` (Member ID: ${memberId})` : ''} with note "${notes || 'Normal check-in'}"`,
      'ATTENDANCE'
    );
  };

  const replaceTeamMember = (
    regId: string,
    originalMemberId: string,
    newMember: {
      name: string;
      rollNumber: string;
      email: string;
      phone?: string;
      department?: string;
      year?: string;
      section?: string;
    },
    reason: string
  ) => {
    const registration = registrations.find(item => item.id === regId);
    const original = registration?.membersList?.find(member => member.id === originalMemberId);
    if (!registration || !original) {
      return { success: false, message: 'Original team member not found in registration record.' };
    }

    const replacementId = `tm_repl_${Date.now()}`;
    const replacedAt = new Date().toISOString();
    const actorName = currentUser?.name || 'Organiser';
    const actorRole = currentRole;

    const replacementRecord: MemberReplacementRecord = {
      id: `rep_hist_${Date.now()}`,
      registrationId: registration.id,
      eventId: registration.eventId,
      teamName: registration.teamName || registration.studentName,
      originalMember: {
        id: original.id,
        name: original.name,
        rollNumber: original.rollNumber,
        email: original.email,
        phone: original.phone,
        department: original.department,
      },
      newMember: {
        id: replacementId,
        name: newMember.name,
        rollNumber: newMember.rollNumber,
        email: newMember.email,
        phone: newMember.phone,
        department: newMember.department,
        year: newMember.year,
        section: newMember.section,
      },
      replacedAt,
      replacedByActorName: actorName,
      replacedByActorRole: actorRole,
      reason,
    };

    const targetEvent = events.find(e => e.id === registration.eventId);
    const minTeamSize = targetEvent?.teamSizeMin || 1;

    setRegistrations(prev => prev.map(item => {
      if (item.id !== regId) return item;

      // Update members list: deactivate original, add replacement as active & present
      const updatedMembers: TeamMember[] = [
        ...(item.membersList || []).map(member => {
          if (member.id === originalMemberId) {
            return {
              ...member,
              attendanceStatus: 'REPLACED' as const,
              attendanceNotes: `Replaced by ${newMember.name} (${newMember.rollNumber}). Reason: ${reason}`,
              isActive: false,
              replacementInfo: {
                replacedByMemberId: replacementId,
                replacedByName: newMember.name,
                replacedByEmail: newMember.email,
                replacedAt,
                replacedByActorName: actorName,
                replacedByActorRole: actorRole,
                reason,
              },
            };
          }
          return member;
        }),
        {
          id: replacementId,
          name: newMember.name,
          rollNumber: newMember.rollNumber,
          email: newMember.email,
          phone: newMember.phone,
          department: newMember.department || original.department,
          year: newMember.year || original.year,
          section: newMember.section || original.section,
          isLead: original.isLead,
          attendanceStatus: 'PRESENT' as const,
          attendanceTimestamp: replacedAt,
          attendanceNotes: `Official Replacement for ${original.name} (${original.rollNumber})`,
          isActive: true,
          isReplacementMember: true,
          replacedOriginalMemberName: original.name,
          replacedOriginalMemberRoll: original.rollNumber,
        },
      ];

      // Re-calculate eligibility & attendance
      const activeMembers = updatedMembers.filter(m => m.attendanceStatus !== 'REPLACED' && m.attendanceStatus !== 'WITHDRAWN');
      const presentMembers = activeMembers.filter(m => m.attendanceStatus === 'PRESENT' || m.attendanceStatus === 'LATE');
      const attendancePercent = activeMembers.length > 0
        ? Math.round((presentMembers.length / activeMembers.length) * 100)
        : 100;

      let eligibility: Registration['teamEligibility'] = 'ELIGIBLE';
      if (activeMembers.length > 1) {
        eligibility = presentMembers.length >= minTeamSize ? 'ELIGIBLE' : 'INCOMPLETE_TEAM';
      } else {
        eligibility = 'ELIGIBLE';
      }

      // If original was lead, update main studentName / email to replacement
      const isLeadReplaced = original.isLead || item.email.toLowerCase() === original.email.toLowerCase();

      return {
        ...item,
        studentName: isLeadReplaced ? newMember.name : item.studentName,
        rollNumber: isLeadReplaced ? newMember.rollNumber : item.rollNumber,
        email: isLeadReplaced ? newMember.email : item.email,
        phone: isLeadReplaced && newMember.phone ? newMember.phone : item.phone,
        membersList: updatedMembers,
        teamMembers: updatedMembers.filter(m => m.isActive).map(m => `${m.name} (${m.rollNumber})`),
        overallAttendancePercentage: attendancePercent,
        teamEligibility: eligibility,
        replacementHistory: [replacementRecord, ...(item.replacementHistory || [])],
        attendance: {
          attended: true,
          timestamp: replacedAt,
          volunteerName: `${actorName} (${actorRole})`,
          arrivalStatus: 'ON_TIME',
          status: 'PRESENT',
        },
        certificateStatus: 'ELIGIBLE',
      };
    }));

    // Notify the newly active member
    const newMemberNotif: NotificationItem = {
      id: `notif_rep_new_${Date.now()}`,
      userId: replacementId,
      targetRole: 'STUDENT',
      eventId: registration.eventId,
      title: 'Added to Event Team Roster 🎉',
      message: `You have been added as an active member in Team "${registration.teamName || 'Squad'}" for ${targetEvent?.title || 'the event'}. Your credentials and schedule are now active.`,
      type: 'SUCCESS',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newMemberNotif, ...prev]);

    addAuditLog(
      'Team Member Replaced',
      `Replaced ${original.name} (${original.rollNumber}) with ${newMember.name} (${newMember.rollNumber}) in Team "${registration.teamName || registration.studentName}". Reason: ${reason}`,
      'ATTENDANCE'
    );

    return {
      success: true,
      message: `✅ Member Replaced: ${newMember.name} (${newMember.rollNumber}) is now active. Notifications and certificates routed to new member.`,
    };
  };

  const finalizeActiveRoster = (eventId: string) => {
    const targetEvent = events.find(e => e.id === eventId);
    const eventRegistrations = registrations.filter(r => r.eventId === eventId);
    
    // Count stats
    const activePresentRegs = eventRegistrations.filter(r => r.attendance?.attended);
    const absentRegs = eventRegistrations.filter(r => !r.attendance?.attended);
    const incompleteTeams = eventRegistrations.filter(r => r.teamEligibility === 'INCOMPLETE_TEAM');
    const totalReplacements = eventRegistrations.reduce((acc, r) => acc + (r.replacementHistory?.length || 0), 0);

    const finalizedAt = new Date().toISOString();
    const actorName = currentUser?.name || 'Organiser Lead';

    // Update event state
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      isRosterFinalized: true,
      rosterFinalizedAt: finalizedAt,
      rosterFinalizedBy: actorName,
    } : e));

    // Send broadcast notification to event coordinators
    const finalizeNotif: NotificationItem = {
      id: `notif_roster_fin_${Date.now()}`,
      targetRole: 'ALL',
      eventId,
      title: 'Active Participant Roster Finalized 📋',
      message: `Active roster locked with ${activePresentRegs.length} verified attendees (${totalReplacements} substitutions processed). Evaluation panels and schedules refreshed.`,
      type: 'INFO',
      timestamp: finalizedAt,
      read: false,
    };
    setNotifications(prev => [finalizeNotif, ...prev]);

    addAuditLog(
      'Active Roster Finalized',
      `Locked active participant roster for "${targetEvent?.title || eventId}" with ${activePresentRegs.length} present, ${absentRegs.length} absent, ${incompleteTeams.length} incomplete teams, and ${totalReplacements} member replacements.`,
      'ATTENDANCE'
    );

    return {
      success: true,
      message: `Active roster finalized: ${activePresentRegs.length} present participants confirmed for evaluation.`,
      activeCount: activePresentRegs.length,
      incompleteCount: incompleteTeams.length,
    };
  };

  const unfinalizeActiveRoster = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      isRosterFinalized: false,
      rosterFinalizedAt: undefined,
      rosterFinalizedBy: undefined,
    } : e));

    addAuditLog(
      'Active Roster Reopened',
      `Reopened participant roster for event ${eventId} for attendance and substitution edits.`,
      'ATTENDANCE'
    );
  };

  const sendAbsenceAlerts = (eventId: string) => {
    const targetEvent = events.find(e => e.id === eventId);
    const absentRegistrations = registrations.filter(r => r.eventId === eventId && !r.attendance?.attended);
    
    const alerts: NotificationItem[] = absentRegistrations.map(r => ({
      id: `notif_absent_${Date.now()}_${r.id}`,
      userId: r.studentId,
      targetRole: 'STUDENT' as const,
      eventId,
      title: 'Attendance Action Required: Pending Check-in ⚠️',
      message: `You have not yet reported to the registration desk for "${targetEvent?.title || 'your event'}". Please report immediately to prevent squad disqualification.`,
      type: 'WARNING' as const,
      timestamp: new Date().toISOString(),
      read: false,
    }));

    if (alerts.length > 0) {
      setNotifications(prev => [...alerts, ...prev]);
    }

    addAuditLog(
      'Absence Alerts Sent',
      `Dispatched urgent attendance notifications to ${alerts.length} absent registered students for event ${eventId}`,
      'ATTENDANCE'
    );

    return {
      sentCount: alerts.length,
      message: `Sent urgent attendance alerts to ${alerts.length} absent participants.`,
    };
  };

  // Round Tracking & Winners
  const updateRoundTracking = (regId: string, roundField: string, value: boolean) => {
    setRegistrations(prev => prev.map(r => {
      if (r.id !== regId) return r;
      return {
        ...r,
        roundTracking: {
          ...r.roundTracking,
          [roundField]: value,
        },
      };
    }));
    addAuditLog('Round Stage Updated', `Updated ${roundField} to ${value} for registration ${regId}`, 'EVENT');
  };

  const setTeamWinnerStatus = (regId: string, status: 'NONE' | 'WINNER' | 'RUNNER_UP_1' | 'RUNNER_UP_2' | 'SPECIAL_MENTION') => {
    setRegistrations(prev => prev.map(r => {
      if (r.id !== regId) return r;
      return {
        ...r,
        roundTracking: {
          ...r.roundTracking,
          winnerStatus: status,
        },
      };
    }));
    addAuditLog('Winner Rank Assigned', `Assigned rank ${status} to registration ${regId}`, 'EVENT');
  };

  const publishEventResults = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, resultsPublished: true, status: 'COMPLETED' } : e));
    addAuditLog('Event Results Published', `Final results and awards officially broadcast for event ${eventId}`, 'EVENT');

    // Notify all participants
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      targetRole: 'ALL',
      eventId,
      title: 'Final Results & Awards Announced! 🏆',
      message: 'Official event rankings have been published. Check out the leaderboard and claim your verified certificates.',
      type: 'SUCCESS',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Certificate Automation & Smart Eligibility Engine
  const evaluateAndGenerateCertificates = (eventId: string) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return { generatedCount: 0, eligibleCount: 0 };

    const eventRegs = registrations.filter(r => r.eventId === eventId);
    const rules = targetEvent.eligibilityRules;
    const template = targetEvent.certificateTemplate;

    let generatedCount = 0;
    let eligibleCount = 0;
    const newCertificates: Certificate[] = [];

    const updatedRegs = eventRegs.map(reg => {
      // Eligibility rules check
      const passesAttendance = !rules.requireAttendance || Boolean(reg.attendance?.attended);
      const passesRound1 = !rules.requireRound1 || Boolean(reg.roundTracking.round1Completed);
      const passesRound2 = !rules.requireRound2 || Boolean(reg.roundTracking.round2Completed);
      const passesFinal = !rules.requireFinalPresentation || Boolean(reg.roundTracking.finalPresentation);

      const isEligible = passesAttendance && (passesRound1 || passesRound2 || passesFinal || reg.roundTracking.participated);

      if (!isEligible) {
        return { ...reg, certificateStatus: 'NOT_ELIGIBLE' as const };
      }

      eligibleCount++;

      // Determine Role & Position Title
      let role: Certificate['recipientRole'] = 'PARTICIPANT';
      let positionTitle = 'Certificate of Active Participation';

      if (reg.roundTracking.winnerStatus === 'WINNER') {
        role = 'WINNER';
        positionTitle = 'First Place • Overall Grand Champion';
      } else if (reg.roundTracking.winnerStatus === 'RUNNER_UP_1') {
        role = 'RUNNER_UP';
        positionTitle = 'First Runner-Up Award of Excellence';
      } else if (reg.roundTracking.winnerStatus === 'RUNNER_UP_2') {
        role = 'RUNNER_UP';
        positionTitle = 'Second Runner-Up Award of Excellence';
      } else if (reg.roundTracking.winnerStatus === 'SPECIAL_MENTION') {
        role = 'PARTICIPANT';
        positionTitle = 'Special Jury Commendation';
      }

      const certId = reg.certificateId || `CERT-${targetEvent.type.substring(0, 2).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const existingCert = certificates.find(c => c.certificateId === certId);
      if (!existingCert) {
        const newCert: Certificate = {
          id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          certificateId: certId,
          eventId: targetEvent.id,
          eventTitle: targetEvent.title,
          eventDate: targetEvent.date,
          recipientId: reg.studentId,
          recipientName: reg.studentName,
          recipientRollNo: reg.rollNumber,
          recipientDept: reg.department,
          recipientEmail: reg.email,
          recipientRole: role,
          positionTitle,
          issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          templateStyle: template,
          status: 'GENERATED',
          verificationUrl: `/verify/${certId}`,
          qrData: `VERIFY:${certId}:STU:${reg.studentName}:${targetEvent.title}:NIET_AUTHENTIC`,
        };
        newCertificates.push(newCert);
        generatedCount++;
      }

      return {
        ...reg,
        certificateId: certId,
        certificateStatus: 'GENERATED' as const,
      };
    });

    // Also generate volunteer certificates for assigned volunteers who checked in
    targetEvent.volunteerAssignments.forEach(va => {
      const volCertId = `CERT-VOL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const existingVolCert = certificates.find(c => c.recipientName === va.volunteerName && c.eventId === eventId);
      if (!existingVolCert && (va.status === 'CHECKED_IN' || va.status === 'COMPLETED')) {
        const newVolCert: Certificate = {
          id: `cert_vol_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          certificateId: volCertId,
          eventId: targetEvent.id,
          eventTitle: targetEvent.title,
          eventDate: targetEvent.date,
          recipientId: va.volunteerId,
          recipientName: va.volunteerName,
          recipientRollNo: 'VOL-LEAD',
          recipientDept: 'Student Organizing Committee',
          recipientEmail: va.volunteerEmail,
          recipientRole: 'VOLUNTEER',
          positionTitle: `Organising Volunteer • ${va.role}`,
          issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          templateStyle: template,
          status: 'GENERATED',
          verificationUrl: `/verify/${volCertId}`,
          qrData: `VERIFY:${volCertId}:VOL:${va.volunteerName}:${targetEvent.title}:NIET_AUTHENTIC`,
        };
        newCertificates.push(newVolCert);
        generatedCount++;
      }
    });

    // Update state
    setRegistrations(prev => prev.map(r => {
      const updated = updatedRegs.find(u => u.id === r.id);
      return updated || r;
    }));

    if (newCertificates.length > 0) {
      setCertificates(prev => [...newCertificates, ...prev]);
    }

    addAuditLog('Certificates Generated by Rule Engine', `Generated ${generatedCount} verified certificates for ${targetEvent.title}`, 'CERTIFICATE');

    return { generatedCount, eligibleCount };
  };

  const sendSingleCertificateEmail = async (certId: string): Promise<boolean> => {
    // Simulate instantaneous SMTP dispatch
    await new Promise(resolve => setTimeout(resolve, 600));

    setCertificates(prev => prev.map(c => {
      if (c.certificateId !== certId) return c;
      return {
        ...c,
        status: 'DELIVERED',
        sentAt: new Date().toISOString(),
      };
    }));

    setRegistrations(prev => prev.map(r => {
      if (r.certificateId !== certId) return r;
      return { ...r, certificateStatus: 'DELIVERED' };
    }));

    const cert = certificates.find(c => c.certificateId === certId);
    if (cert) {
      addAuditLog('Certificate Emailed', `Sent credential ${certId} to ${cert.recipientEmail}`, 'CERTIFICATE');
      
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: cert.recipientId,
        targetRole: 'STUDENT',
        eventId: cert.eventId,
        title: 'Verified Certificate Delivered 📜',
        message: `Your ${cert.recipientRole} certificate for "${cert.eventTitle}" was dispatched to ${cert.recipientEmail}.`,
        type: 'CERTIFICATE',
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);
    }

    return true;
  };

  const sendAllEligibleCertificates = async (eventId: string): Promise<{ sentCount: number }> => {
    const eventCerts = certificates.filter(c => c.eventId === eventId && (c.status === 'GENERATED' || c.status === 'PENDING'));
    
    // Simulate batch dispatch
    await new Promise(resolve => setTimeout(resolve, 1000));

    setCertificates(prev => prev.map(c => {
      if (c.eventId === eventId && (c.status === 'GENERATED' || c.status === 'PENDING')) {
        return {
          ...c,
          status: 'DELIVERED',
          sentAt: new Date().toISOString(),
        };
      }
      return c;
    }));

    setRegistrations(prev => prev.map(r => {
      if (r.eventId === eventId && r.certificateStatus === 'GENERATED') {
        return { ...r, certificateStatus: 'DELIVERED' };
      }
      return r;
    }));

    addAuditLog('Batch Certificate Email Run', `Dispatched ${eventCerts.length} certificates to recipient inboxes`, 'CERTIFICATE');

    return { sentCount: eventCerts.length };
  };

  const getCertificateById = (certId: string): Certificate | undefined => {
    return certificates.find(c => c.certificateId.toLowerCase() === certId.toLowerCase() || c.id === certId);
  };

  const uploadAndDispatchCertificates = async (
    eventId: string,
    candidates: CandidateBatchUploadItem[],
    emailConfig: EmailDispatchConfig,
    onProgress?: (current: number, total: number, candidate: CandidateBatchUploadItem) => void
  ): Promise<{ success: boolean; sentCount: number; failedCount: number }> => {
    const targetEvent = events.find(e => e.id === eventId);
    const eventTitle = targetEvent ? targetEvent.title : 'Academic Excellence Event';
    const eventDate = targetEvent ? targetEvent.date : new Date().toLocaleDateString();
    const template = targetEvent?.certificateTemplate || {
      id: `tmpl_${eventId}`,
      name: `${eventTitle} Official Template`,
      theme: 'classic-gold',
      signatoryName: 'Prof. Rajesh Sharma & Dr. Arthur Vance',
      signatoryTitle: 'Event Convener & Dean of Academics',
      signatoryDepartment: 'Department of Computer Science & Engineering',
      collegeName: 'National Institute of Engineering & Technology',
      collegeLogoText: 'NIET • AI EVENT OPERATING SYSTEM',
      borderStyle: 'ornate',
    };

    let sentCount = 0;
    let failedCount = 0;
    const newCertificates: Certificate[] = [];
    const updatedCertificates = [...certificates];

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      if (onProgress) {
        onProgress(i + 1, candidates.length, candidate);
      }

      // Small realistic network delay between sends
      await new Promise(resolve => setTimeout(resolve, 250));

      if (!candidate.email || !candidate.name) {
        failedCount++;
        continue;
      }

      const certId =
        candidate.certId ||
        `CERT-${(targetEvent?.type || 'EV').substring(0, 2).toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const role = candidate.role || 'PARTICIPANT';
      const positionTitle =
        candidate.positionTitle ||
        (role === 'WINNER'
          ? 'First Place • Grand Champion'
          : role === 'RUNNER_UP'
          ? 'Runner-Up Award of Excellence'
          : role === 'VOLUNTEER'
          ? 'Organising Volunteer Award'
          : 'Certificate of Active Participation');

      const receiptId = `RCPT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const newCert: Certificate = {
        id: `cert_upload_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`,
        certificateId: certId,
        eventId: eventId,
        eventTitle: eventTitle,
        eventDate: eventDate,
        recipientId: candidate.rollNo || candidate.email,
        recipientName: candidate.name,
        recipientRollNo: candidate.rollNo || 'REG-AUTO',
        recipientDept: candidate.department || targetEvent?.organizingDepartment || 'Computer Science & Engineering',
        recipientEmail: candidate.email,
        recipientRole: role,
        positionTitle: positionTitle,
        issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        templateStyle: template,
        status: 'DELIVERED',
        verificationUrl: `/verify/${certId}`,
        qrData: `VERIFY:${certId}:STU:${candidate.name}:${eventTitle}:NIET_AUTHENTIC`,
        sentAt: new Date().toISOString(),
        customFileName: candidate.customFileName,
        customFileUrl: candidate.customFileUrl,
        emailSubject: emailConfig.subject.replace('{{candidateName}}', candidate.name).replace('{{eventName}}', eventTitle),
        deliveryReceiptId: receiptId,
      };

      // Check if certificate with this certId already exists; update or insert
      const existingIdx = updatedCertificates.findIndex(
        c => c.certificateId === certId || (c.eventId === eventId && c.recipientEmail.toLowerCase() === candidate.email.toLowerCase())
      );

      if (existingIdx >= 0) {
        updatedCertificates[existingIdx] = { ...updatedCertificates[existingIdx], ...newCert };
      } else {
        newCertificates.push(newCert);
        updatedCertificates.unshift(newCert);
      }

      // Add instant in-app notification to student
      const notif: NotificationItem = {
        id: `notif_${Date.now()}_${i}`,
        targetRole: 'STUDENT',
        eventId: eventId,
        title: `Verified Certificate Dispatched 📜 (${role})`,
        message: `Your verified certificate for "${eventTitle}" has been delivered to ${candidate.email}. Certificate ID: ${certId}`,
        type: 'CERTIFICATE',
        timestamp: new Date().toISOString(),
        read: false,
        link: `/verify/${certId}`,
      };
      setNotifications(prev => [notif, ...prev]);

      sentCount++;
    }

    setCertificates(updatedCertificates);

    addAuditLog(
      'Bulk File Upload & Email Dispatch',
      `Uploaded candidate files & successfully emailed ${sentCount} certificates for event "${eventTitle}"`,
      'CERTIFICATE'
    );

    return { success: true, sentCount, failedCount };
  };

  const addManualCertificate = (
    certData: Partial<Certificate> & { eventId: string; recipientName: string; recipientEmail: string }
  ): Certificate => {
    const targetEvent = events.find(e => e.id === certData.eventId);
    const eventTitle = targetEvent ? targetEvent.title : 'Academic Excellence Event';
    const certId =
      certData.certificateId ||
      `CERT-MAN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const template = targetEvent?.certificateTemplate || {
      id: `tmpl_${certData.eventId}`,
      name: `${eventTitle} Official Template`,
      theme: 'classic-gold',
      signatoryName: 'Prof. Rajesh Sharma & Dr. Arthur Vance',
      signatoryTitle: 'Event Convener & Dean of Academics',
      signatoryDepartment: 'Department of Computer Science & Engineering',
      collegeName: 'National Institute of Engineering & Technology',
      collegeLogoText: 'NIET • AI EVENT OPERATING SYSTEM',
      borderStyle: 'ornate',
    };

    const newCert: Certificate = {
      id: `cert_man_${Date.now()}`,
      certificateId: certId,
      eventId: certData.eventId,
      eventTitle: eventTitle,
      eventDate: targetEvent?.date || new Date().toLocaleDateString(),
      recipientId: certData.recipientRollNo || certData.recipientEmail,
      recipientName: certData.recipientName,
      recipientRollNo: certData.recipientRollNo || '21CS099',
      recipientDept: certData.recipientDept || 'Computer Science & Engineering',
      recipientEmail: certData.recipientEmail,
      recipientRole: certData.recipientRole || 'PARTICIPANT',
      positionTitle: certData.positionTitle || 'Certificate of Active Participation',
      issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      templateStyle: template,
      status: 'DELIVERED',
      verificationUrl: `/verify/${certId}`,
      qrData: `VERIFY:${certId}:STU:${certData.recipientName}:${eventTitle}:NIET_AUTHENTIC`,
      sentAt: new Date().toISOString(),
      customFileName: certData.customFileName,
      customFileUrl: certData.customFileUrl,
      deliveryReceiptId: `RCPT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    };

    setCertificates(prev => [newCert, ...prev]);

    // Send in-app notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      targetRole: 'STUDENT',
      eventId: certData.eventId,
      title: 'Verified Certificate Generated & Sent 📜',
      message: `Your certificate for "${eventTitle}" was dispatched to ${certData.recipientEmail}. Verification ID: ${certId}`,
      type: 'CERTIFICATE',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);

    addAuditLog(
      'Manual Certificate Generated & Emailed',
      `Issued and dispatched ${certId} to candidate ${certData.recipientName} (${certData.recipientEmail})`,
      'CERTIFICATE'
    );

    return newCert;
  };

  const deleteCertificate = (certId: string): boolean => {
    setCertificates(prev => prev.filter(c => c.certificateId !== certId && c.id !== certId));
    addAuditLog('Certificate Revoked/Removed', `Deleted certificate record ${certId}`, 'CERTIFICATE');
    return true;
  };

  const reissueCertificate = (certId: string): boolean => {
    setCertificates(prev =>
      prev.map(c => {
        if (c.certificateId === certId || c.id === certId) {
          return {
            ...c,
            status: 'DELIVERED',
            sentAt: new Date().toISOString(),
            deliveryReceiptId: `RCPT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          };
        }
        return c;
      })
    );
    addAuditLog('Certificate Re-issued', `Re-dispatched certificate email for ${certId}`, 'CERTIFICATE');
    return true;
  };

  // Admin User Management
  const toggleUserApproval = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isApproved: !u.isApproved } : u));
    addAuditLog('User Approval Toggled', `Updated approval state for user ID ${userId}`, 'ADMIN');
  };

  const toggleUserActive = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
    addAuditLog('User Status Toggled', `Toggled active/disabled status for user ${userId}`, 'ADMIN');
  };

  const addUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: userData.name || 'New User',
      email: userData.email || 'user@college.edu',
      role: userData.role || 'STUDENT',
      department: userData.department || 'Computer Science & Engineering',
      phone: userData.phone || '+91 90000 00000',
      studentRollNo: userData.studentRollNo,
      year: userData.year,
      section: userData.section,
      adminId: userData.adminId,
      isApproved: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog('User Account Created', `Added ${newUser.role} profile for ${newUser.name}`, 'ADMIN');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        users,
        events,
        registrations,
        certificates,
        auditLogs,
        notifications,
        activeEventId,
        setActiveEventId,
        login,
        registerUser,
        logout,
        switchDemoRole,
        createEvent,
        updateEvent,
        deleteEvent,
        updateEventForm,
        updateEventAgenda,
        updateEventPanels,
        updateEventAllocations,
        updateVolunteerAssignments,
        updateCertificateTemplate,
        registerStudent,
        updateRegistrationStatus,
        addDemoRegistration,
        recordQRAttendance,
        recordManualAttendance,
        markParticipantAttendance,
        replaceTeamMember,
        finalizeActiveRoster,
        unfinalizeActiveRoster,
        sendAbsenceAlerts,
        updateRoundTracking,
        setTeamWinnerStatus,
        publishEventResults,
        evaluateAndGenerateCertificates,
        sendSingleCertificateEmail,
        sendAllEligibleCertificates,
        getCertificateById,
        uploadAndDispatchCertificates,
        addManualCertificate,
        deleteCertificate,
        reissueCertificate,
        toggleUserApproval,
        toggleUserActive,
        addUser,
        addAuditLog,
        markNotificationRead,
        clearAllNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

