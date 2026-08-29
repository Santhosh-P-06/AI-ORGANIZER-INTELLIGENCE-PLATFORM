import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  EventItem,
  CertificateTemplate,
  CandidateBatchUploadItem,
  EmailDispatchConfig,
} from '../../types';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Mail,
  Send,
  Download,
  Eye,
  Settings,
  RefreshCw,
  QrCode,
  ShieldCheck,
  FileCheck,
  Upload,
  Trash2,
  Plus,
  Zap,
  Search,
  CheckCheck,
  GraduationCap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateSystemProps {
  event: EventItem;
  onOpenVerificationModal: (certId: string) => void;
}

export const CertificateSystem: React.FC<CertificateSystemProps> = ({
  event,
  onOpenVerificationModal,
}) => {
  const {
    certificates,
    registrations,
    evaluateAndGenerateCertificates,
    sendSingleCertificateEmail,
    sendAllEligibleCertificates,
    uploadAndDispatchCertificates,
    addManualCertificate,
    deleteCertificate,
    updateCertificateTemplate,
  } = useApp();

  // Primary sub-view tabs
  const [activeSubTab, setActiveSubTab] = useState<
    'UPLOAD_DISPATCH' | 'REGISTRY' | 'SMART_RULES' | 'TEMPLATE_STUDIO' | 'MANUAL_ISSUE'
  >('UPLOAD_DISPATCH');

  // File upload & Batch dispatch state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);

  // Parsed candidates ready to be dispatched
  const [candidates, setCandidates] = useState<CandidateBatchUploadItem[]>([
    {
      id: 'cand_1',
      name: 'Rahul Sharma',
      email: 'rahul.k@college.edu',
      rollNo: '21CS042',
      department: 'Computer Science & Engineering',
      role: 'WINNER',
      positionTitle: 'First Place • Overall Grand Champion',
      status: 'PENDING',
    },
    {
      id: 'cand_2',
      name: 'Priya Venkatesh',
      email: 'priya.v@college.edu',
      rollNo: '21CS088',
      department: 'Computer Science & Engineering',
      role: 'RUNNER_UP',
      positionTitle: 'First Runner-Up Award of Excellence',
      status: 'PENDING',
    },
    {
      id: 'cand_3',
      name: 'Ananya Sen',
      email: 'ananya.s@college.edu',
      rollNo: '22IT019',
      department: 'Information Technology',
      role: 'PARTICIPANT',
      positionTitle: 'Certificate of Active Participation',
      status: 'PENDING',
    },
    {
      id: 'cand_4',
      name: 'Karthik Raja',
      email: 'karthik.r@college.edu',
      rollNo: '21EC055',
      department: 'Electronics & Communication',
      role: 'PARTICIPANT',
      positionTitle: 'Certificate of Active Participation',
      status: 'PENDING',
    },
    {
      id: 'cand_5',
      name: 'Sneha Patel',
      email: 'sn6703648@gmail.com',
      rollNo: '22AI031',
      department: 'Artificial Intelligence & DS',
      role: 'WINNER',
      positionTitle: 'Best Innovative Solution Award',
      status: 'PENDING',
    },
  ]);

  // Email Config State
  const [emailConfig, setEmailConfig] = useState<EmailDispatchConfig>({
    subject: `🎓 Official Verified Certificate for {{eventName}} - National Institute of Engineering`,
    senderName: `${event.coordinatorName || 'Prof. Rajesh Sharma'} (Event Convener)`,
    senderEmail: event.contactEmail || 'events@college.edu',
    bodyText: `Dear {{candidateName}},\n\nCongratulations on your participation and outstanding achievement at {{eventName}} conducted by the Department of ${event.organizingDepartment} on ${event.date}.\n\nYour verified digital academic credential has been cryptographically generated and issued under Certificate ID {{certId}}.\n\nYou can access, download, and verify your credential anytime using the official link below.\n\nBest regards,\nOrganizing Committee\nNational Institute of Engineering & Technology`,
    attachPdf: true,
    attachQrCode: true,
    includeVerificationLink: true,
    customSignature: 'Prof. Rajesh Sharma\nConvener, AI & Hackathon Cell',
  });

  // Dispatch progress state
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState<{
    current: number;
    total: number;
    currentCandidate: string;
    currentEmail: string;
    logs: Array<{ email: string; name: string; time: string; status: string }>;
  }>({
    current: 0,
    total: 0,
    currentCandidate: '',
    currentEmail: '',
    logs: [],
  });
  const [dispatchComplete, setDispatchComplete] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Manual Single Candidate state
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualRoll, setManualRoll] = useState('');
  const [manualDept, setManualDept] = useState(event.organizingDepartment || 'Computer Science & Engineering');
  const [manualRole, setManualRole] = useState<'PARTICIPANT' | 'WINNER' | 'RUNNER_UP' | 'VOLUNTEER'>('PARTICIPANT');
  const [manualPosition, setManualPosition] = useState('Certificate of Active Participation');
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);

  // Smart Rule Evaluation & Single Dispatch state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [sendingCertId, setSendingCertId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Template customizer state
  const [template, setTemplate] = useState<CertificateTemplate>(
    event.certificateTemplate || {
      id: `tmpl_${event.id}`,
      name: `${event.title} Official Template`,
      theme: 'classic-gold',
      signatoryName: 'Prof. Rajesh Sharma & Dr. Arthur Vance',
      signatoryTitle: 'Event Convener & Dean of Academics',
      signatoryDepartment: 'Department of Computer Science & Engineering',
      collegeName: 'National Institute of Engineering & Technology',
      collegeLogoText: 'NIET • AI EVENT OPERATING SYSTEM',
      borderStyle: 'ornate',
    }
  );
  const [templateSavedMsg, setTemplateSavedMsg] = useState(false);

  const eventCerts = certificates.filter((c) => c.eventId === event.id);
  const eventRegs = registrations.filter((r) => r.eventId === event.id);
  const deliveredCount = eventCerts.filter((c) => c.status === 'DELIVERED').length;

  // File Drop & Parse Handler
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (fileEvt) => {
      const text = fileEvt.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length > 1) {
          const parsedList: CandidateBatchUploadItem[] = [];
          const startIdx = lines[0].toLowerCase().includes('email') || lines[0].toLowerCase().includes('name') ? 1 : 0;

          for (let i = startIdx; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
            if (cols.length >= 2) {
              const name = cols[0] || `Candidate ${i}`;
              const email = cols[1] || `student${i}@college.edu`;
              const rollNo = cols[2] || `21CS${String(i).padStart(3, '0')}`;
              const dept = cols[3] || event.organizingDepartment || 'Computer Science & Engineering';
              const rawRole = (cols[4] || 'PARTICIPANT').toUpperCase();
              
              let role: 'PARTICIPANT' | 'WINNER' | 'RUNNER_UP' | 'VOLUNTEER' = 'PARTICIPANT';
              if (rawRole.includes('WINNER') || rawRole.includes('1ST') || rawRole.includes('CHAMPION')) role = 'WINNER';
              else if (rawRole.includes('RUNNER') || rawRole.includes('2ND')) role = 'RUNNER_UP';
              else if (rawRole.includes('VOLUNTEER')) role = 'VOLUNTEER';

              const pos = cols[5] || (role === 'WINNER' ? 'First Place • Overall Grand Champion' : role === 'RUNNER_UP' ? 'Runner-Up Award of Excellence' : role === 'VOLUNTEER' ? 'Organising Volunteer Award' : 'Certificate of Active Participation');

              parsedList.push({
                id: `cand_parsed_${Date.now()}_${i}`,
                name,
                email,
                rollNo,
                department: dept,
                role,
                positionTitle: pos,
                customFileName: file.name,
                status: 'PENDING',
              });
            }
          }

          if (parsedList.length > 0) {
            setCandidates(parsedList);
            confetti({ particleCount: 50, spread: 50 });
          }
        }
      } catch (err) {
        console.error('Failed to parse file:', err);
      }
    };

    reader.readAsText(file);
  };

  // Download Sample CSV
  const handleDownloadSampleCSV = () => {
    const csvContent =
      'Name,Email,RollNumber,Department,Role,PositionAward\n' +
      'Rahul Sharma,rahul.k@college.edu,21CS042,Computer Science & Engineering,WINNER,First Place Grand Champion\n' +
      'Priya Venkatesh,priya.v@college.edu,21CS088,Computer Science & Engineering,RUNNER_UP,First Runner-Up Award of Excellence\n' +
      'Ananya Sen,ananya.s@college.edu,22IT019,Information Technology,PARTICIPANT,Certificate of Active Participation\n' +
      'Karthik Raja,karthik.r@college.edu,21EC055,Electronics & Communication,PARTICIPANT,Certificate of Active Participation\n' +
      'Sneha Patel,sn6703648@gmail.com,22AI031,Artificial Intelligence & DS,WINNER,Best Technical Innovation\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Candidate_Certificate_Roster_Template_${event.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1-Click Load Demo Batch
  const handleLoadDemoBatch = () => {
    setUploadedFileName('TechnoHack_2026_Final_Roster.csv');
    setUploadedFileSize('4.2 KB');
    setCandidates([
      {
        id: 'cand_demo_1',
        name: 'Rahul Sharma',
        email: 'rahul.k@college.edu',
        rollNo: '21CS042',
        department: 'Computer Science & Engineering',
        role: 'WINNER',
        positionTitle: 'First Place • Overall Grand Champion',
        status: 'PENDING',
      },
      {
        id: 'cand_demo_2',
        name: 'Priya Venkatesh',
        email: 'priya.v@college.edu',
        rollNo: '21CS088',
        department: 'Computer Science & Engineering',
        role: 'RUNNER_UP',
        positionTitle: 'First Runner-Up Award of Excellence',
        status: 'PENDING',
      },
      {
        id: 'cand_demo_3',
        name: 'Ananya Sen',
        email: 'ananya.s@college.edu',
        rollNo: '22IT019',
        department: 'Information Technology',
        role: 'PARTICIPANT',
        positionTitle: 'Certificate of Active Participation',
        status: 'PENDING',
      },
      {
        id: 'cand_demo_4',
        name: 'Karthik Raja',
        email: 'karthik.r@college.edu',
        rollNo: '21EC055',
        department: 'Electronics & Communication',
        role: 'PARTICIPANT',
        positionTitle: 'Certificate of Active Participation',
        status: 'PENDING',
      },
      {
        id: 'cand_demo_5',
        name: 'Sneha Patel',
        email: 'sn6703648@gmail.com',
        rollNo: '22AI031',
        department: 'Artificial Intelligence & DS',
        role: 'WINNER',
        positionTitle: 'Best Innovative Solution Award',
        status: 'PENDING',
      },
    ]);
    confetti({ particleCount: 40, spread: 60 });
  };

  // Add / Edit Candidate in table
  const handleAddCandidateRow = () => {
    const newCand: CandidateBatchUploadItem = {
      id: `cand_row_${Date.now()}`,
      name: '',
      email: '',
      rollNo: '',
      department: event.organizingDepartment || 'Computer Science & Engineering',
      role: 'PARTICIPANT',
      positionTitle: 'Certificate of Active Participation',
      status: 'PENDING',
    };
    setCandidates((prev) => [...prev, newCand]);
  };

  const handleUpdateCandidate = (id: string, field: keyof CandidateBatchUploadItem, val: any) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: val };
        if (field === 'role') {
          if (val === 'WINNER') updated.positionTitle = 'First Place • Overall Grand Champion';
          else if (val === 'RUNNER_UP') updated.positionTitle = 'Runner-Up Award of Excellence';
          else if (val === 'VOLUNTEER') updated.positionTitle = 'Organising Volunteer Award';
          else updated.positionTitle = 'Certificate of Active Participation';
        }
        return updated;
      })
    );
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  // Execute Upload & Dispatch
  const handleExecuteDispatch = async () => {
    if (candidates.length === 0) return;

    const invalid = candidates.filter((c) => !c.email || !c.email.includes('@'));
    if (invalid.length > 0) {
      alert(`Please ensure all candidates have valid email IDs (${invalid.length} missing email).`);
      return;
    }

    setIsDispatching(true);
    setDispatchComplete(false);
    setDispatchProgress({
      current: 0,
      total: candidates.length,
      currentCandidate: '',
      currentEmail: '',
      logs: [],
    });

    await uploadAndDispatchCertificates(
      event.id,
      candidates,
      emailConfig,
      (current, total, cand) => {
        setDispatchProgress((prev) => ({
          current,
          total,
          currentCandidate: cand.name,
          currentEmail: cand.email,
          logs: [
            {
              name: cand.name,
              email: cand.email,
              time: new Date().toLocaleTimeString(),
              status: '200 OK • Delivered to candidate inbox',
            },
            ...prev.logs,
          ],
        }));
      }
    );

    setIsDispatching(false);
    setDispatchComplete(true);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.55 } });
  };

  // Manual Single Candidate Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualEmail) return;

    addManualCertificate({
      eventId: event.id,
      recipientName: manualName,
      recipientEmail: manualEmail,
      recipientRollNo: manualRoll || '21CS099',
      recipientDept: manualDept,
      recipientRole: manualRole,
      positionTitle: manualPosition,
    });

    setManualSuccessMsg(`✅ Certificate generated & successfully emailed to ${manualEmail}!`);
    setManualName('');
    setManualEmail('');
    setManualRoll('');
    confetti({ particleCount: 60, spread: 60 });
    setTimeout(() => setManualSuccessMsg(null), 4000);
  };

  // Smart Rule Evaluation
  const handleEvaluateAndGenerate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      evaluateAndGenerateCertificates(event.id);
      setIsEvaluating(false);
      confetti({ particleCount: 60, spread: 60 });
    }, 600);
  };

  const handleSendAll = async () => {
    setIsSendingAll(true);
    await sendAllEligibleCertificates(event.id);
    setIsSendingAll(false);
    confetti({ particleCount: 80, spread: 70 });
  };

  const handleSendSingle = async (certId: string) => {
    setSendingCertId(certId);
    await sendSingleCertificateEmail(certId);
    setSendingCertId(null);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    updateCertificateTemplate(event.id, template);
    setTemplateSavedMsg(true);
    setTimeout(() => setTemplateSavedMsg(false), 3000);
  };

  // Filtered Registry
  const filteredCerts = eventCerts.filter((c) => {
    const matchesSearch =
      c.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.recipientRollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.certificateId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'ALL' || c.recipientRole === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & Navigation */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Smart Academic Certificate Automation & Email Dispatcher</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-100">
              Verified Candidate Credentials & Auto-Mailer
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Upload candidate roster sheets (CSV/Excel) or individual certificate files, map their institutional email IDs, and instantly dispatch tamper-proof digital certificates with cryptographic QR verification.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveSubTab('UPLOAD_DISPATCH')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'UPLOAD_DISPATCH'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>File Upload & Auto-Email</span>
            </button>

            <button
              onClick={() => setActiveSubTab('REGISTRY')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'REGISTRY'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Issued Registry ({eventCerts.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('TEMPLATE_STUDIO')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'TEMPLATE_STUDIO'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Template & Seals</span>
            </button>

            <button
              onClick={() => setActiveSubTab('MANUAL_ISSUE')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'MANUAL_ISSUE'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span>Single Candidate</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Eligible Candidates</div>
              <div className="text-lg font-bold text-slate-100 font-display">
                {eventRegs.filter((r) => r.attendance?.attended).length || candidates.length}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Generated & Verifiable</div>
              <div className="text-lg font-bold text-amber-400 font-display">{eventCerts.length}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Emailed to Candidate Inbox</div>
              <div className="text-lg font-bold text-emerald-400 font-display">{deliveredCount}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Security Standard</div>
              <div className="text-xs font-bold text-emerald-400">100% Cryptographic QR</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: BULK FILE UPLOAD & CANDIDATE EMAIL AUTO-DISPATCHER (PRIMARY)  */}
      {/* ========================================================================= */}
      {activeSubTab === 'UPLOAD_DISPATCH' && (
        <div className="space-y-6">
          {/* Section 1: Drag & Drop File Upload Zone */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-950/30 shadow-xl'
                    : 'border-slate-700 hover:border-indigo-500/60 bg-slate-900/60 hover:bg-slate-900/90'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".csv,.xlsx,.xls,.txt,.json,.pdf,.png,.jpg"
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>

                <h3 className="text-base font-bold text-slate-200">
                  {uploadedFileName ? `Active File: ${uploadedFileName}` : 'Drag & Drop Candidate File or Click to Upload'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Supports candidate roster spreadsheets (<span className="text-indigo-300 font-mono">.csv, .xlsx, .json</span>) or batch certificate files. Automatically parses student names, email addresses, and awards.
                </p>

                {uploadedFileName && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Loaded {uploadedFileName} ({uploadedFileSize}) • {candidates.length} Candidate Records Detected</span>
                  </div>
                )}
              </div>

              {/* Quick Helper Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSampleCSV}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV Format Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadDemoBatch}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-500/40 font-semibold transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Load Demo Candidate Roster (5 Students)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddCandidateRow}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Candidate Row</span>
                </button>
              </div>
            </div>

            {/* Email Dispatch Configuration Settings Box */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Email Dispatcher Setup
                  </span>
                </div>
                <button
                  onClick={() => setShowEmailPreview(!showEmailPreview)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                >
                  {showEmailPreview ? 'Hide Preview' : 'Preview Email Layout'}
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={emailConfig.subject}
                    onChange={(e) => setEmailConfig({ ...emailConfig, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Supports dynamic tags</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={emailConfig.senderName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Sender Email</label>
                    <input
                      type="email"
                      value={emailConfig.senderEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Email Body Template</label>
                  <textarea
                    rows={4}
                    value={emailConfig.bodyText}
                    onChange={(e) => setEmailConfig({ ...emailConfig, bodyText: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={emailConfig.attachPdf}
                      onChange={(e) => setEmailConfig({ ...emailConfig, attachPdf: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-700 text-indigo-600"
                    />
                    <span>Attach high-res PDF certificate file</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={emailConfig.attachQrCode}
                      onChange={(e) => setEmailConfig({ ...emailConfig, attachQrCode: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-700 text-indigo-600"
                    />
                    <span>Embed cryptographic verification QR code</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Email Preview Drawer if toggled */}
          {showEmailPreview && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Live Preview: What the Student Sees in their Inbox
                </span>
                <span className="text-[11px] text-slate-400 font-mono">To: rahul.k@college.edu</span>
              </div>

              <div className="p-6 rounded-xl bg-white text-slate-900 space-y-4 shadow-xl max-w-2xl mx-auto">
                <div className="border-b pb-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">National Institute of Engineering & Technology</h4>
                    <span className="text-xs text-slate-500">Official Academic Credential Notification</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                    <Award className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>

                <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
                  <p>Dear <strong>Rahul Sharma</strong>,</p>
                  <p>
                    Congratulations on your outstanding achievement at <strong>{event.title}</strong> conducted on {event.date}!
                  </p>
                  <p>
                    Your digital certificate (Certificate ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-indigo-700">CERT-TH-2026-8812</code>) is verified and attached below.
                  </p>
                </div>

                {/* Simulated Certificate Attachment Badge */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Official_Certificate_Rahul_Sharma.pdf</div>
                      <div className="text-[10px] text-slate-500">Tamper-Proof Digital Credential (2.4 MB)</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-indigo-600 text-white text-[11px] font-bold">
                    View Verified Certificate
                  </span>
                </div>

                <div className="pt-3 border-t text-[10px] text-slate-500">
                  Sent by {emailConfig.senderName} • Department of {event.organizingDepartment}
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Candidate Email Mapping Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>Candidate Email Mapping Roster</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
                    {candidates.length} Ready to Dispatch
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Verify or edit candidate email IDs before dispatching. Each candidate will receive their unique certificate directly at their specified email address.
                </p>
              </div>

              {/* Master Dispatch CTA Button */}
              <button
                type="button"
                onClick={handleExecuteDispatch}
                disabled={isDispatching || candidates.length === 0}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isDispatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Emails ({dispatchProgress.current}/{dispatchProgress.total})...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Upload & Send Certificates to Candidates ({candidates.length})</span>
                  </>
                )}
              </button>
            </div>

            {/* Candidates Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">Candidate Name</th>
                    <th className="p-3.5">Recipient Mail ID (Target)</th>
                    <th className="p-3.5">Roll No</th>
                    <th className="p-3.5">Award / Role</th>
                    <th className="p-3.5">Position Title</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {candidates.map((cand, idx) => (
                    <tr key={cand.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5 text-slate-500 font-mono">{idx + 1}</td>

                      <td className="p-3.5">
                        <input
                          type="text"
                          value={cand.name}
                          onChange={(e) => handleUpdateCandidate(cand.id, 'name', e.target.value)}
                          placeholder="Candidate Name"
                          className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 font-semibold focus:outline-none focus:border-indigo-500 text-xs"
                        />
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <input
                            type="email"
                            value={cand.email}
                            onChange={(e) => handleUpdateCandidate(cand.id, 'email', e.target.value)}
                            placeholder="student@college.edu"
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </td>

                      <td className="p-3.5">
                        <input
                          type="text"
                          value={cand.rollNo}
                          onChange={(e) => handleUpdateCandidate(cand.id, 'rollNo', e.target.value)}
                          placeholder="Roll No"
                          className="w-24 px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </td>

                      <td className="p-3.5">
                        <select
                          value={cand.role}
                          onChange={(e) => handleUpdateCandidate(cand.id, 'role', e.target.value)}
                          className="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="WINNER">Winner (1st Place)</option>
                          <option value="RUNNER_UP">Runner-Up</option>
                          <option value="PARTICIPANT">Participant</option>
                          <option value="VOLUNTEER">Volunteer</option>
                        </select>
                      </td>

                      <td className="p-3.5">
                        <input
                          type="text"
                          value={cand.positionTitle || ''}
                          onChange={(e) => handleUpdateCandidate(cand.id, 'positionTitle', e.target.value)}
                          placeholder="Position Title"
                          className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveCandidate(cand.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Live Dispatch Progress Modal / Banner */}
          {(isDispatching || dispatchComplete) && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    dispatchComplete ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white animate-pulse'
                  }`}>
                    {dispatchComplete ? <CheckCheck className="w-5 h-5" /> : <RefreshCw className="w-5 h-5 animate-spin" />}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-100">
                      {dispatchComplete ? 'All Certificates Successfully Dispatched!' : 'Live Automated Email Dispatch in Progress'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {dispatchComplete
                        ? `${dispatchProgress.total} candidate certificates were emailed with cryptographic verification credentials.`
                        : `Currently transmitting to candidate: ${dispatchProgress.currentCandidate} (${dispatchProgress.currentEmail})`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSubTab('REGISTRY')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  View Issued Registry & Delivery Logs →
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400 font-semibold">
                  <span>Progress ({dispatchProgress.current} / {dispatchProgress.total} Delivered)</span>
                  <span>{dispatchProgress.total > 0 ? Math.round((dispatchProgress.current / dispatchProgress.total) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500 transition-all duration-300"
                    style={{
                      width: `${dispatchProgress.total > 0 ? (dispatchProgress.current / dispatchProgress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Transmission Logs */}
              <div className="max-h-36 overflow-y-auto space-y-1 p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800">
                {dispatchProgress.logs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-300 py-0.5">
                    <span className="text-emerald-400">✓ [{log.time}] Emailed {log.name} &lt;{log.email}&gt;</span>
                    <span className="text-slate-500 text-[10px]">{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: ISSUED CERTIFICATE REGISTRY & DELIVERY TRACKER                */}
      {/* ========================================================================= */}
      {activeSubTab === 'REGISTRY' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by candidate name, email, roll no, or cert ID..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Award Roles</option>
                <option value="WINNER">Winners</option>
                <option value="RUNNER_UP">Runner-Ups</option>
                <option value="PARTICIPANT">Participants</option>
                <option value="VOLUNTEER">Volunteers</option>
              </select>

              {eventCerts.length > 0 && (
                <button
                  onClick={handleSendAll}
                  disabled={isSendingAll}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSendingAll ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Resend All ({eventCerts.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Certificate Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Certificate ID</th>
                  <th className="p-3.5">Candidate Details</th>
                  <th className="p-3.5">Award / Category</th>
                  <th className="p-3.5">Delivery Status</th>
                  <th className="p-3.5">Sent Timestamp</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-xs text-slate-500">
                      No matching issued certificates found. Use "File Upload & Auto-Email" to import candidates.
                    </td>
                  </tr>
                ) : (
                  filteredCerts.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5 font-mono text-amber-300 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>{cert.certificateId}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{cert.recipientName}</div>
                        <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{cert.recipientEmail}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {cert.recipientRollNo} • {cert.recipientDept}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${
                            cert.recipientRole === 'WINNER'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                              : cert.recipientRole === 'RUNNER_UP'
                              ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                              : cert.recipientRole === 'VOLUNTEER'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
                          }`}
                        >
                          {cert.positionTitle || cert.recipientRole}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {cert.status === 'DELIVERED' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Emailed & Verified</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Queued</span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                        {cert.sentAt ? new Date(cert.sentAt).toLocaleString() : cert.issueDate}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenVerificationModal(cert.certificateId)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors cursor-pointer"
                            title="Preview Authentic Certificate"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleSendSingle(cert.certificateId)}
                            disabled={sendingCertId === cert.certificateId}
                            className="p-1.5 px-2 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            title="Resend to Candidate Email"
                          >
                            {sendingCertId === cert.certificateId ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                            <span>Resend</span>
                          </button>

                          <button
                            onClick={() => deleteCertificate(cert.certificateId)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Revoke / Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: SMART RULE EVALUATION ENGINE                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'SMART_RULES' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Automated Attendance & Round Progression Rules</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically scans registered participants, confirmed volunteer check-ins, and judges' leaderboard results to generate credentials.
              </p>
            </div>

            <button
              onClick={handleEvaluateAndGenerate}
              disabled={isEvaluating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isEvaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Execute Rule Engine & Generate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-indigo-400">Rule 1: Attendance Threshold</span>
              <div className="text-xs font-semibold text-slate-200">Requires Verified QR Check-in</div>
              <p className="text-[11px] text-slate-400">Only candidates scanned by volunteers at registration desk pass threshold.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-amber-400">Rule 2: Podium Rank Matrix</span>
              <div className="text-xs font-semibold text-slate-200">Jury Round Evaluation</div>
              <p className="text-[11px] text-slate-400">Teams flagged as WINNER or RUNNER_UP automatically receive Distinction Honors.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Rule 3: Volunteer Recognition</span>
              <div className="text-xs font-semibold text-slate-200">Roster Completion Check</div>
              <p className="text-[11px] text-slate-400">Checked-in volunteers receive dedicated Organizing Committee certificates.</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: VISUAL TEMPLATE STUDIO & SEALS                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'TEMPLATE_STUDIO' && (
        <form onSubmit={handleSaveTemplate} className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Certificate Visual Layout, Watermarks & Signatures
                </span>
              </div>
              {templateSavedMsg && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Template Saved Successfully!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Visual Theme Palette</label>
                <select
                  value={template.theme}
                  onChange={(e) => setTemplate({ ...template, theme: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-semibold"
                >
                  <option value="classic-gold">Classic Gold & Royal Ivory</option>
                  <option value="tech-blue">Cyber Tech & Neon Indigo</option>
                  <option value="modern-emerald">Emerald Prestige & Forest</option>
                  <option value="crimson-prestige">Crimson Academic & Platinum</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Institution / University Name</label>
                <input
                  type="text"
                  value={template.collegeName}
                  onChange={(e) => setTemplate({ ...template, collegeName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Watermark Banner</label>
                <input
                  type="text"
                  value={template.collegeLogoText}
                  onChange={(e) => setTemplate({ ...template, collegeLogoText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Official Signatory Names</label>
                <input
                  type="text"
                  value={template.signatoryName}
                  onChange={(e) => setTemplate({ ...template, signatoryName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Signatory Titles</label>
                <input
                  type="text"
                  value={template.signatoryTitle}
                  onChange={(e) => setTemplate({ ...template, signatoryTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Issuing Department</label>
                <input
                  type="text"
                  value={template.signatoryDepartment}
                  onChange={(e) => setTemplate({ ...template, signatoryDepartment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
              >
                Save Certificate Template
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 5: MANUAL SINGLE CANDIDATE ISSUE                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'MANUAL_ISSUE' && (
        <form onSubmit={handleManualSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Plus className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100">Issue Single Certificate with Instant Email Delivery</h3>
          </div>

          {manualSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              {manualSuccessMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Candidate Full Name *</label>
              <input
                type="text"
                required
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Candidate Email ID (for Delivery) *</label>
              <input
                type="email"
                required
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="student@college.edu or gmail.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-emerald-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Student Roll Number</label>
              <input
                type="text"
                value={manualRoll}
                onChange={(e) => setManualRoll(e.target.value)}
                placeholder="e.g. 21CS042"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Department</label>
              <input
                type="text"
                value={manualDept}
                onChange={(e) => setManualDept(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Award Category</label>
              <select
                value={manualRole}
                onChange={(e) => {
                  const r = e.target.value as any;
                  setManualRole(r);
                  if (r === 'WINNER') setManualPosition('First Place • Grand Champion');
                  else if (r === 'RUNNER_UP') setManualPosition('Runner-Up Award of Excellence');
                  else if (r === 'VOLUNTEER') setManualPosition('Organising Volunteer Award');
                  else setManualPosition('Certificate of Active Participation');
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-semibold"
              >
                <option value="PARTICIPANT">Participant</option>
                <option value="WINNER">Winner (1st Place)</option>
                <option value="RUNNER_UP">Runner-Up</option>
                <option value="VOLUNTEER">Volunteer</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Position / Honor Title</label>
              <input
                type="text"
                value={manualPosition}
                onChange={(e) => setManualPosition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Generate & Send Certificate to Candidate Email</span>
          </button>
        </form>
      )}
    </div>
  );
};
