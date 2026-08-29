import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Registration, EventItem } from '../../types';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  FileJson,
  X,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface RegistrationManagerProps {
  event: EventItem;
}

export const RegistrationManager: React.FC<RegistrationManagerProps> = ({ event }) => {
  const { registrations, updateRegistrationStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  const eventRegs = registrations.filter((r) => r.eventId === event.id);

  // Filters
  const filteredRegs = eventRegs.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.teamName && r.teamName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesDept = deptFilter === 'ALL' || r.department.toLowerCase().includes(deptFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesDept;
  });

  const confirmedCount = eventRegs.filter((r) => r.status === 'CONFIRMED').length;
  const pendingCount = eventRegs.filter((r) => r.status === 'PENDING').length;
  const capacityPercent = Math.min(100, Math.round((eventRegs.length / event.maxStudents) * 100));

  const departments = Array.from(new Set(eventRegs.map((r) => r.department)));

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Reg ID', 'Student Name', 'Roll No', 'Email', 'Phone', 'Department', 'Year', 'Team Name', 'Attendance Status', 'Registered At'];
    const rows = filteredRegs.map((r) => [
      r.id,
      `"${r.studentName}"`,
      r.rollNumber,
      r.email,
      r.phone,
      `"${r.department}"`,
      r.year,
      `"${r.teamName || 'N/A'}"`,
      r.attendance?.attended ? 'PRESENT' : 'ABSENT',
      r.registeredAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredRegs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Registrations.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Capacity & Summary Header Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Registered</div>
          <div className="text-2xl font-bold font-display text-slate-100 mt-1">
            {eventRegs.length} <span className="text-xs font-normal text-slate-500">/ {event.maxStudents} cap</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${capacityPercent >= 90 ? 'bg-rose-500' : 'bg-indigo-500'}`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Confirmed Seats</div>
          <div className="text-2xl font-bold font-display text-emerald-400 mt-1">{confirmedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Approved for event entry</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Teams Formed</div>
          <div className="text-2xl font-bold font-display text-sky-400 mt-1">
            {new Set(eventRegs.filter((r) => r.teamName).map((r) => r.teamName)).size}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Max capacity: {event.maxTeams} teams</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Registration Status</div>
          <div className="text-sm font-bold text-slate-100 mt-1 flex items-center gap-1.5">
            {eventRegs.length >= event.maxStudents ? (
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Capacity Locked (Full)
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Open & Accepting
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Controls Bar: Search, Filters, Export */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, roll no, team..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none max-w-[160px] truncate"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Export Actions */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            title="Export JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-sky-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Registrations Data Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3.5">Student / Roll</th>
              <th className="p-3.5">Department & Year</th>
              <th className="p-3.5">Team</th>
              <th className="p-3.5">Check-in Status</th>
              <th className="p-3.5">Reg Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRegs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-slate-500">
                  No student registrations matching your filters.
                </td>
              </tr>
            ) : (
              filteredRegs.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-200">{reg.studentName}</div>
                    <div className="text-[11px] font-mono text-indigo-400 mt-0.5">{reg.rollNumber}</div>
                    <div className="text-[10px] text-slate-500">{reg.email}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="text-slate-300 font-medium">{reg.department}</div>
                    <div className="text-[11px] text-slate-500">{reg.year} • {reg.section}</div>
                  </td>

                  <td className="p-3.5">
                    {reg.teamName ? (
                      <div>
                        <span className="px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 font-medium text-[11px]">
                          {reg.teamName}
                        </span>
                        {reg.teamMembers && reg.teamMembers.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            +{reg.teamMembers.length} members
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Individual</span>
                    )}
                  </td>

                  <td className="p-3.5">
                    {reg.attendance?.attended ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Checked In
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-[11px]">
                        <Clock className="w-3 h-3" /> Pending QR
                      </span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        reg.status === 'CONFIRMED'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                          : reg.status === 'PENDING'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedReg(reg)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                        title="View Custom Form Responses"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {reg.status !== 'CONFIRMED' && (
                        <button
                          onClick={() => updateRegistrationStatus(reg.id, 'CONFIRMED')}
                          className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 text-[11px] font-semibold border border-emerald-500/30"
                        >
                          Approve
                        </button>
                      )}

                      {reg.status !== 'REJECTED' && (
                        <button
                          onClick={() => updateRegistrationStatus(reg.id, 'REJECTED')}
                          className="px-2 py-1 rounded bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 text-[11px] font-semibold border border-rose-500/30"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Response Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-base font-display font-bold text-slate-100">
                  Registration Form Submission
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedReg.studentName} ({selectedReg.rollNumber})
                </p>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Student Email</span>
                  <div className="font-semibold text-slate-200">{selectedReg.email}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Contact Number</span>
                  <div className="font-semibold text-slate-200">{selectedReg.phone}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Department</span>
                  <div className="font-semibold text-slate-200">{selectedReg.department}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">College</span>
                  <div className="font-semibold text-slate-200">{selectedReg.college}</div>
                </div>
              </div>

              {/* Dynamic AI Custom Form Responses */}
              <div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                  Event-Specific Custom Responses
                </h4>
                <div className="space-y-2">
                  {Object.entries(selectedReg.customResponses || {}).map(([key, value]) => {
                    const matchedField = event.registrationForm.find((f) => f.id === key);
                    const label = matchedField ? matchedField.label : key;
                    return (
                      <div key={key} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <div className="text-[11px] font-semibold text-slate-400 mb-1">{label}</div>
                        <div className="text-slate-200 font-medium whitespace-pre-wrap">
                          {String(value) || <span className="text-slate-600 italic">Not provided</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QR Badge Data */}
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                <div className="text-[11px] font-bold text-indigo-300">Assigned QR Check-in Code Data</div>
                <div className="font-mono text-[10px] text-slate-400 break-all mt-1">
                  {selectedReg.qrCodeData}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
