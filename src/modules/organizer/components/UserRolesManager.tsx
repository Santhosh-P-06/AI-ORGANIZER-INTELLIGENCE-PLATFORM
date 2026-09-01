'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useTheme } from '../../../context/ThemeContext';
import { User, UserRole } from '../../../types';
import {
  Shield,
  Users,
  Calendar,
  Award,
  Activity,
  UserCheck,
  GraduationCap,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Building,
  KeyRound,
  IdCard,
  Mail,
  Phone,
  UserPlus,
  ShieldCheck,
  X,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UserRolesManager: React.FC = () => {
  const {
    users,
    toggleUserApproval,
    toggleUserActive,
    addUser,
    currentUser,
  } = useApp();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('VOLUNTEER');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [studentRollNo, setStudentRollNo] = useState('');
  const [volunteerIdInput, setVolunteerIdInput] = useState('');

  // Statistics
  const totalUsers = users.length;
  const organizersCount = users.filter((u) => u.role === 'ORGANISER').length;
  const volunteersCount = users.filter((u) => u.role === 'VOLUNTEER').length;
  const studentsCount = users.filter((u) => u.role === 'STUDENT').length;
  const approvedCount = users.filter((u) => u.isApproved).length;

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      department,
      phone: phone.trim(),
      studentRollNo: role === 'STUDENT' ? studentRollNo.trim().toUpperCase() || '23CS101' : undefined,
      volunteerId: role === 'VOLUNTEER' ? volunteerIdInput.trim().toUpperCase() || `VOL-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
    });

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    setShowAddUserModal(false);
    setName('');
    setEmail('');
    setStudentRollNo('');
    setVolunteerIdInput('');
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.studentRollNo && u.studentRollNo.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.volunteerId && u.volunteerId.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(userSearch.toLowerCase()));
    
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-[11px] font-semibold text-indigo-500">Organisers</div>
          <div className="text-2xl font-bold font-display mt-0.5" style={{ color: 'var(--text-primary)' }}>{organizersCount}</div>
          <div className="text-[10px] text-slate-400">Faculty & event leads</div>
        </div>

        <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-[11px] font-semibold text-emerald-500">Volunteers</div>
          <div className="text-2xl font-bold font-display text-emerald-500 mt-0.5">{volunteersCount}</div>
          <div className="text-[10px] text-slate-400">Authorized check-in staff</div>
        </div>

        <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-[11px] font-semibold text-sky-500">Students / Participants</div>
          <div className="text-2xl font-bold font-display text-sky-500 mt-0.5">{studentsCount}</div>
          <div className="text-[10px] text-slate-400">Enrolled collegiate accounts</div>
        </div>

        <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
          <div className="text-[11px] font-semibold text-amber-500">Approval Rate</div>
          <div className="text-2xl font-bold font-display text-amber-500 mt-0.5">
            {totalUsers > 0 ? Math.round((approvedCount / totalUsers) * 100) : 0}%
          </div>
          <div className="text-[10px] text-slate-400">{approvedCount} / {totalUsers} verified</div>
        </div>
      </div>

      {/* Action Bar: Search, Filters, Add User */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search accounts by name, email, roll no, volunteer ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none transition-all"
            style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none cursor-pointer"
            style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="ORGANISER">Organisers ({organizersCount})</option>
            <option value="VOLUNTEER">Volunteers ({volunteersCount})</option>
            <option value="STUDENT">Students ({studentsCount})</option>
          </select>

          <button
            type="button"
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create User Account</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}>
        <table className="w-full text-left text-xs">
          <thead className="border-b uppercase text-[10px] tracking-wider" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
            <tr>
              <th className="p-3.5">User Identity</th>
              <th className="p-3.5">Assigned Role</th>
              <th className="p-3.5">Private ID / Roll</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Approval</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Access Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
            {filteredUsers.map((u) => {
              const isLeadRole = u.role === 'ORGANISER';
              const isVolRole = u.role === 'VOLUNTEER';
              const isStudentRole = u.role === 'STUDENT';

              return (
                <tr key={u.id} className="hover:bg-slate-500/5 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{u.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider"
                      style={{
                        backgroundColor: isLeadRole ? 'var(--role-organiser-bg)' : isVolRole ? 'var(--role-volunteer-bg)' : 'var(--role-student-bg)',
                        color: isLeadRole ? 'var(--role-organiser-color)' : isVolRole ? 'var(--role-volunteer-color)' : 'var(--role-student-color)',
                        borderColor: isLeadRole ? 'rgba(79,70,229,0.3)' : isVolRole ? 'rgba(5,150,105,0.3)' : 'rgba(2,132,199,0.3)',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="p-3.5 font-mono text-[11px]">
                    {u.volunteerId ? (
                      <span className="px-2 py-0.5 rounded font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/30">
                        {u.volunteerId}
                      </span>
                    ) : u.studentRollNo ? (
                      <span className="text-sky-500 font-semibold">{u.studentRollNo}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="p-3.5 text-slate-400">{u.department}</td>

                  <td className="p-3.5">
                    {u.isApproved ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : (
                      <span className="text-amber-500 font-semibold flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>

                  <td className="p-3.5">
                    {u.isActive ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600">
                        Suspended
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleUserApproval(u.id)}
                        className="px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer"
                        style={{
                          backgroundColor: u.isApproved ? 'rgba(239,68,68,0.08)' : 'rgba(5,150,105,0.08)',
                          color: u.isApproved ? '#ef4444' : '#059669',
                          borderColor: u.isApproved ? 'rgba(239,68,68,0.3)' : 'rgba(5,150,105,0.3)',
                        }}
                      >
                        {u.isApproved ? 'Revoke' : 'Approve'}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleUserActive(u.id)}
                        className="px-2.5 py-1 rounded-lg border text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                        style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)' }}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md rounded-3xl border shadow-2xl p-6 animate-scale-in"
            style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-display font-bold" style={{ color: 'var(--text-primary)' }}>
                  Create & Grant Role
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Add a new organizer, student coordinator (volunteer), or participant account.
            </p>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  User Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Kumar / Priya V"
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  College Email ID *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    System Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  >
                    <option value="ORGANISER">Event Organiser</option>
                    <option value="VOLUNTEER">Student Volunteer</option>
                    <option value="STUDENT">Student Participant</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Artificial Intelligence & DS">AI & DS</option>
                    <option value="Information Technology">IT</option>
                    <option value="Electronics & Comm Engg">ECE</option>
                    <option value="Mechanical Engineering">Mech</option>
                  </select>
                </div>
              </div>

              {role === 'VOLUNTEER' && (
                <div>
                  <label className="block font-semibold mb-1 text-emerald-500">
                    Private Volunteer ID
                  </label>
                  <input
                    type="text"
                    value={volunteerIdInput}
                    onChange={(e) => setVolunteerIdInput(e.target.value)}
                    placeholder="e.g. VOL-7821 (auto-generated if empty)"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>
              )}

              {role === 'STUDENT' && (
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Student Roll Number
                  </label>
                  <input
                    type="text"
                    value={studentRollNo}
                    onChange={(e) => setStudentRollNo(e.target.value)}
                    placeholder="e.g. 22CS045"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                  style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--border-default)' }}>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                  style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surface-raised)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
