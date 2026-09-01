import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { EventItem, VolunteerAssignment } from '../../../types';
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
} from 'lucide-react';

interface VolunteerManagerProps {
  event: EventItem;
}

export const VolunteerManager: React.FC<VolunteerManagerProps> = ({ event }) => {
  const { updateVolunteerAssignments, users } = useApp();
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>(event.volunteerAssignments || []);
  const [showAddModal, setShowAddModal] = useState(false);

  // New assignment form state
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerEmail, setVolunteerEmail] = useState('');
  const [volunteerPhone, setVolunteerPhone] = useState('+91 98450 99881');
  const [role, setRole] = useState<VolunteerAssignment['role']>('Attendance & QR Verification');
  const [location, setLocation] = useState('Auditorium Entry Gate A');
  const [timeSlot, setTimeSlot] = useState('08:30 AM - 01:00 PM');

  const volunteerRoles: VolunteerAssignment['role'][] = [
    'Registration Desk Coordinator',
    'Attendance & QR Verification',
    'Lab / Room Logistics Lead',
    'Jury Panel Coordination',
    'Student Guidance & Helpdesk',
    'Stage & Certificate Distribution',
    'Time Keeper & Stage Manager',
  ];

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerName.trim()) return;

    const newAssignment: VolunteerAssignment = {
      id: `va_${Date.now()}`,
      volunteerId: `vol_${Date.now()}`,
      volunteerName,
      volunteerEmail,
      volunteerPhone,
      role,
      location,
      assignedLocation: location,
      timeSlot,
      status: 'ASSIGNED',
    };

    const updated = [newAssignment, ...assignments];
    setAssignments(updated);
    updateVolunteerAssignments(event.id, updated);
    setShowAddModal(false);

    // Reset form
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

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Roster</div>
          <div className="text-2xl font-bold font-display text-slate-100 mt-1">{assignments.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Assigned student volunteers</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Active on Duty</div>
          <div className="text-2xl font-bold font-display text-emerald-400 mt-1">{activeVolunteers}</div>
          <div className="text-[11px] text-slate-500 mt-1">Checked in at assigned stations</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Roster Coordination</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">Live duty tracking</div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Volunteer</span>
          </button>
        </div>
      </div>

      {/* Volunteer Duty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{item.volunteerName}</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-500" /> {item.volunteerEmail}
                  </p>
                </div>
                <button
                  onClick={() => toggleStatus(item.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                    item.status === 'CHECKED_IN'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : item.status === 'COMPLETED'
                      ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Click to toggle status"
                >
                  {item.status}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 my-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="font-semibold text-slate-200">{item.role}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>{item.assignedLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <span className="font-mono text-[11px]">{item.timeSlot}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Phone: {item.volunteerPhone}</span>
              <button
                onClick={() => handleRemoveAssignment(item.id)}
                className="text-slate-500 hover:text-rose-400 p-1"
                title="Remove from roster"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Volunteer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-display font-bold text-slate-100 mb-1">
              Assign Volunteer Responsibility
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Designate student coordinators to critical operational stations.
            </p>

            <form onSubmit={handleAddAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Volunteer Full Name</label>
                <input
                  type="text"
                  required
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  placeholder="e.g. Priya Venkatesh"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Volunteer College Email</label>
                <input
                  type="email"
                  required
                  value={volunteerEmail}
                  onChange={(e) => setVolunteerEmail(e.target.value)}
                  placeholder="priya.v@college.edu"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Responsibility Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as VolunteerAssignment['role'])}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                >
                  {volunteerRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Duty Location / Room</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lab 101 or Gate A"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Time Slot</label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="08:30 AM - 01:00 PM"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
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
