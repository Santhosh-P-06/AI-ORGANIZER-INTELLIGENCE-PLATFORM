'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useTheme } from '../../../context/ThemeContext';
import { EventItem, VolunteerAssignment, User } from '../../../types';
import {
  UserCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  Phone,
  Shield,
  Send,
  Search,
  KeyRound,
  IdCard,
  Sparkles,
  X,
  UserPlus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VolunteerManagerProps {
  event: EventItem;
}

export const VolunteerManager: React.FC<VolunteerManagerProps> = ({ event }) => {
  const { updateVolunteerAssignments, users } = useApp();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [assignments, setAssignments] = useState<VolunteerAssignment[]>(event.volunteerAssignments || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Quick ID assignment state
  const [quickVolId, setQuickVolId] = useState('');
  const [quickNotice, setQuickNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New assignment form state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [volunteerIdInput, setVolunteerIdInput] = useState('');
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerEmail, setVolunteerEmail] = useState('');
  const [volunteerPhone, setVolunteerPhone] = useState('+91 98450 99881');
  const [role, setRole] = useState<VolunteerAssignment['role']>('Attendance & QR Verification');
  const [location, setLocation] = useState('Auditorium Entry Gate A');
  const [timeSlot, setTimeSlot] = useState('08:30 AM - 01:00 PM');

  const registeredVolunteers = users.filter((u) => u.role === 'VOLUNTEER');

  const volunteerRoles: VolunteerAssignment['role'][] = [
    'Registration Desk Coordinator',
    'Attendance & QR Verification',
    'Lab / Room Logistics Lead',
    'Jury Panel Coordination',
    'Student Guidance & Helpdesk',
    'Stage & Certificate Distribution',
    'Time Keeper & Stage Manager',
  ];

  // Quick Assign by Volunteer ID
  const handleQuickAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const idToSearch = quickVolId.trim().toUpperCase();
    if (!idToSearch) return;

    // Check if already assigned
    if (assignments.some((a) => a.volunteerId?.toUpperCase() === idToSearch || a.id.toUpperCase() === idToSearch)) {
      setQuickNotice({ text: `Volunteer ID ${idToSearch} is already assigned to this event.`, type: 'error' });
      setTimeout(() => setQuickNotice(null), 3500);
      return;
    }

    // Find in registered users
    const matchedUser = users.find(
      (u) =>
        u.volunteerId?.toUpperCase() === idToSearch ||
        u.id.toUpperCase() === idToSearch ||
        u.studentRollNo?.toUpperCase() === idToSearch
    );

    const vName = matchedUser?.name || `Volunteer (${idToSearch})`;
    const vEmail = matchedUser?.email || `${idToSearch.toLowerCase()}@college.edu`;
    const vPhone = matchedUser?.phone || '+91 98000 00000';

    const newAssignment: VolunteerAssignment = {
      id: `va_${Date.now()}`,
      volunteerId: matchedUser?.volunteerId || idToSearch,
      volunteerName: vName,
      volunteerEmail: vEmail,
      volunteerPhone: vPhone,
      role: 'Attendance & QR Verification',
      location: 'Main Foyer / Attendance Desk',
      assignedLocation: 'Main Foyer / Attendance Desk',
      timeSlot: `${event.startTime} - ${event.endTime}`,
      status: 'CHECKED_IN',
      notes: `Assigned via Volunteer ID ${idToSearch}`,
    };

    const updated = [newAssignment, ...assignments];
    setAssignments(updated);
    updateVolunteerAssignments(event.id, updated);
    setQuickVolId('');
    setQuickNotice({ text: `✓ Successfully assigned ${vName} (ID: ${newAssignment.volunteerId}) to ${event.title}`, type: 'success' });
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setQuickNotice(null), 4000);
  };

  const handleSelectRegisteredUser = (userId: string) => {
    setSelectedUserId(userId);
    const u = users.find((x) => x.id === userId);
    if (u) {
      setVolunteerName(u.name);
      setVolunteerEmail(u.email);
      setVolunteerPhone(u.phone || '+91 98450 99881');
      setVolunteerIdInput(u.volunteerId || `VOL-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerName.trim()) return;

    const assignedVolId = volunteerIdInput.trim() || `VOL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAssignment: VolunteerAssignment = {
      id: `va_${Date.now()}`,
      volunteerId: assignedVolId,
      volunteerName,
      volunteerEmail,
      volunteerPhone,
      role,
      location,
      assignedLocation: location,
      timeSlot,
      status: 'CHECKED_IN',
      notes: `Private ID: ${assignedVolId}`,
    };

    const updated = [newAssignment, ...assignments];
    setAssignments(updated);
    updateVolunteerAssignments(event.id, updated);
    setShowAddModal(false);

    // Reset form
    setSelectedUserId('');
    setVolunteerIdInput('');
    setVolunteerName('');
    setVolunteerEmail('');
  };

  const handleRemoveAssignment = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    setAssignments(updated);
    updateVolunteerAssignments(event.id, updated);
  };

  const toggleStatus = (id: string) => {
    const updated = assignments.map((a) => {
      if (a.id !== id) return a;
      const nextStatus: VolunteerAssignment['status'] =
        a.status === 'ASSIGNED' ? 'CHECKED_IN' : a.status === 'CHECKED_IN' ? 'COMPLETED' : 'ASSIGNED';
      return { ...a, status: nextStatus };
    });
    setAssignments(updated);
    updateVolunteerAssignments(event.id, updated);
  };

  const activeVolunteers = assignments.filter((a) => a.status === 'CHECKED_IN').length;

  const filteredAssignments = assignments.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.volunteerName.toLowerCase().includes(q) ||
      item.volunteerEmail.toLowerCase().includes(q) ||
      (item.volunteerId && item.volunteerId.toLowerCase().includes(q)) ||
      item.role.toLowerCase().includes(q) ||
      (item.assignedLocation && item.assignedLocation.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-xs text-slate-400 font-semibold">Total Assigned Volunteers</div>
          <div className="text-2xl font-bold font-display mt-1" style={{ color: 'var(--text-primary)' }}>{assignments.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Authorized for check-in access</div>
        </div>

        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-xs font-semibold text-emerald-500">Active on Duty</div>
          <div className="text-2xl font-bold font-display text-emerald-500 mt-1">{activeVolunteers}</div>
          <div className="text-[11px] text-slate-400 mt-1">Checked in at duty stations</div>
        </div>

        <div className="p-5 rounded-2xl border flex flex-col justify-between" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-xs text-slate-400 font-semibold">Volunteer Assignment Portal</div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Volunteer</span>
          </button>
        </div>
      </div>

      {/* Quick Assign by Volunteer ID Box */}
      <div className="p-5 rounded-3xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Quick Assign by Private Volunteer ID
              </h3>
              <p className="text-xs text-slate-400">
                Enter a volunteer's private ID to grant them attendance check-in access for this event.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleQuickAssign} className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <IdCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={quickVolId}
              onChange={(e) => setQuickVolId(e.target.value)}
              placeholder="Enter Volunteer ID (e.g. VOL-7821 or VOL-9142)..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 font-mono"
              style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Grant Check-In Access</span>
          </button>
        </form>

        {quickNotice && (
          <div className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            quickNotice.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
          }`}>
            {quickNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span>{quickNotice.text}</span>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assigned volunteers by name, ID, or station..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none border"
            style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Volunteer Duty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssignments.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3"
            style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.volunteerName}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/30">
                      ID: {item.volunteerId || 'VOL-AUTH'}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.volunteerEmail}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleStatus(item.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                    item.status === 'CHECKED_IN'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : item.status === 'COMPLETED'
                      ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                  }`}
                  title="Click to toggle status"
                >
                  {item.status}
                </button>
              </div>

              <div className="space-y-1.5 text-xs my-3 pt-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <div className="flex items-center gap-2 font-semibold text-indigo-500">
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{item.role}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>Station: {item.assignedLocation || item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                  <span className="font-mono text-[11px]">{item.timeSlot}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
              <span className="text-[10px] text-slate-400">Phone: {item.volunteerPhone || 'N/A'}</span>
              <button
                type="button"
                onClick={() => handleRemoveAssignment(item.id)}
                className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                title="Revoke check-in access"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Volunteer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border shadow-2xl p-6" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                Assign Volunteer & Grant Access
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select an enrolled student coordinator or enter their details to assign their Private Volunteer ID.
            </p>

            <form onSubmit={handleAddAssignment} className="space-y-3 text-xs">
              {registeredVolunteers.length > 0 && (
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Quick Select from Registered Volunteers
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => handleSelectRegisteredUser(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  >
                    <option value="">-- Choose Registered Volunteer --</option>
                    {registeredVolunteers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.volunteerId || u.studentRollNo || u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Private Volunteer ID *
                </label>
                <input
                  type="text"
                  required
                  value={volunteerIdInput}
                  onChange={(e) => setVolunteerIdInput(e.target.value)}
                  placeholder="e.g. VOL-7821"
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none font-mono"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Volunteer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  placeholder="e.g. Priya Venkatesh"
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Volunteer College Email *
                </label>
                <input
                  type="email"
                  required
                  value={volunteerEmail}
                  onChange={(e) => setVolunteerEmail(e.target.value)}
                  placeholder="priya.v@college.edu"
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Assigned Responsibility Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as VolunteerAssignment['role'])}
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                >
                  {volunteerRoles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Duty Location / Check-In Station
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Auditorium Entry Gate A"
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Time Slot
                </label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="08:30 AM - 01:00 PM"
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl border font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md transition-all"
                >
                  Assign to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
