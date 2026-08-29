import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, AuditLog } from '../../types';
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
  FileText,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    events,
    registrations,
    certificates,
    auditLogs,
    toggleUserApproval,
    toggleUserActive,
    addUser,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'METRICS' | 'USERS' | 'AUDIT'>('METRICS');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditCategory, setAuditCategory] = useState<string>('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('ORGANISER');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [studentRollNo, setStudentRollNo] = useState('');

  const totalEvents = events.length;
  const totalRegs = registrations.length;
  const totalCerts = certificates.length;
  const totalVolunteers = users.filter((u) => u.role === 'VOLUNTEER').length;

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addUser({
      name,
      email,
      role,
      department,
      phone,
      studentRollNo: role === 'STUDENT' ? studentRollNo || '23CS101' : undefined,
    });

    setShowAddUserModal(false);
    setName('');
    setEmail('');
    setStudentRollNo('');
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.studentRollNo && u.studentRollNo.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesCategory = auditCategory === 'ALL' || log.category === auditCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 pb-16">
      {/* Top Banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 font-bold text-[10px] uppercase tracking-wider">
                  Institutional Governance & Administration
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-medium">{currentUser?.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-100 tracking-tight">
                System Overview & Security Audit Center
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span>Enterprise Governance OS</span>
                <span>•</span>
                <span className="text-amber-400 font-medium">{users.length} Active System Accounts</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">{auditLogs.length} Verified Log Entries</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('METRICS')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'METRICS'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Metrics & Usage</span>
              </button>

              <button
                onClick={() => setActiveTab('USERS')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'USERS'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>User Roles ({users.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('AUDIT')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'AUDIT'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Audit Logs ({auditLogs.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* TAB 1: METRICS & USAGE */}
        {activeTab === 'METRICS' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Total Events Hosted</div>
                <div className="text-2xl font-bold font-display text-indigo-400 mt-1">{totalEvents}</div>
                <div className="text-[11px] text-slate-500 mt-1">Across all departments</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Student Registrations</div>
                <div className="text-2xl font-bold font-display text-sky-400 mt-1">{totalRegs}</div>
                <div className="text-[11px] text-slate-500 mt-1">Total seats occupied</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Volunteers On Duty</div>
                <div className="text-2xl font-bold font-display text-emerald-400 mt-1">{totalVolunteers}</div>
                <div className="text-[11px] text-slate-500 mt-1">Rostered staff</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Certificates Issued</div>
                <div className="text-2xl font-bold font-display text-amber-400 mt-1">{totalCerts}</div>
                <div className="text-[11px] text-slate-500 mt-1">Tamper-proof verifiable</div>
              </div>
            </div>

            {/* Department Level Adoption */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100">
                  Departmental Platform Utilization & Event Quotas
                </h3>
                <span className="text-xs text-slate-500">Autonomous Faculty Portals</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-indigo-300 text-xs">Computer Science & Engineering</div>
                  <div className="text-xs text-slate-400">Events: 2 Active • 120 Registrations</div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[85%]" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-sky-300 text-xs">Information Technology</div>
                  <div className="text-xs text-slate-400">Events: 1 Active • 45 Registrations</div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full w-[60%]" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-purple-300 text-xs">AI & Data Science</div>
                  <div className="text-xs text-slate-400">Events: 1 Active • 60 Registrations</div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-[70%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'USERS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name, email, roll no..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ORGANISER">Organisers</option>
                  <option value="VOLUNTEER">Volunteers</option>
                  <option value="STUDENT">Students</option>
                  <option value="ADMIN">Admins</option>
                </select>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">User Identity</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Approval</th>
                    <th className="p-3.5">Active Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {u.email} {u.studentRollNo && `• ${u.studentRollNo}`}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ORGANISER'
                              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30'
                              : u.role === 'VOLUNTEER'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                              : u.role === 'STUDENT'
                              ? 'bg-sky-950/80 text-sky-300 border border-sky-500/30'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-300">{u.department}</td>

                      <td className="p-3.5">
                        {u.isApproved ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {u.isActive ? (
                          <span className="text-emerald-400 text-[11px]">Active</span>
                        ) : (
                          <span className="text-rose-400 text-[11px]">Suspended</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleUserApproval(u.id)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                          >
                            {u.isApproved ? 'Revoke' : 'Approve'}
                          </button>
                          <button
                            onClick={() => toggleUserActive(u.id)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                          >
                            {u.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT LOGS */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search audit trail by actor, action, details..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <select
                value={auditCategory}
                onChange={(e) => setAuditCategory(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="EVENT">Event Lifecycle</option>
                <option value="ATTENDANCE">QR Attendance</option>
                <option value="ALLOCATION">Panel Allocation</option>
                <option value="CERTIFICATE">Certificates</option>
                <option value="AUTH">Authentication</option>
                <option value="ADMIN">Administration</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor & Role</th>
                    <th className="p-3.5">Action Executed</th>
                    <th className="p-3.5">Telemetry Details</th>
                    <th className="p-3.5">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/50 font-mono text-[11px]">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>

                      <td className="p-3.5 text-slate-300 font-sans">
                        <div className="font-semibold">{log.actorName}</div>
                        <div className="text-[10px] text-slate-500">{log.actorRole}</div>
                      </td>

                      <td className="p-3.5 font-sans font-semibold text-slate-200">{log.action}</td>

                      <td className="p-3.5 text-slate-400 font-sans">{log.details}</td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-amber-300 border border-slate-800">
                          {log.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-display font-bold text-slate-100 mb-1">
              Create System Account
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add verified faculty organiser, volunteer, student, or admin profile.
            </p>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Vance"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vance@college.edu"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                >
                  <option value="ORGANISER">Organiser</option>
                  <option value="VOLUNTEER">Volunteer</option>
                  <option value="STUDENT">Student</option>
                  <option value="ADMIN">Institutional Admin</option>
                </select>
              </div>

              {role === 'STUDENT' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Student Roll Number</label>
                  <input
                    type="text"
                    value={studentRollNo}
                    onChange={(e) => setStudentRollNo(e.target.value)}
                    placeholder="23CS101"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
