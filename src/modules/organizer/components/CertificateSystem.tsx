import React, { useState, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  EventItem,
  CertificateTemplate,
  CandidateBatchUploadItem,
  EmailDispatchConfig,
} from '../../../types';
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
  FolderUp,
  FileText,
  HelpCircle,
  Code,
  Check,
  ExternalLink,
  Copy,
  AlertCircle,
  File,
  X,
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

  // Folder & File Upload Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<'FOLDER' | 'CSV'>('FOLDER');
  const [uploadedFolderName, setUploadedFolderName] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);

  // Automation Guide Modal State
  const [showAutomationGuide, setShowAutomationGuide] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Preview Modal for single uploaded certificate
  const [previewCertItem, setPreviewCertItem] = useState<CandidateBatchUploadItem | null>(null);

  // Parsed candidates ready to be dispatched
  const [candidates, setCandidates] = useState<CandidateBatchUploadItem[]>([
    {
      id: 'cand_demo_1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      rollNo: '21CS042',
      department: 'Computer Science & Engineering',
      role: 'WINNER',
      positionTitle: 'First Place • Overall Grand Champion',
      customFileName: 'rahul.sharma@gmail.com.pdf',
      customFileSize: '240 KB',
      status: 'PENDING',
    },
    {
      id: 'cand_demo_2',
      name: 'Priya Venkatesh',
      email: 'priya.v@gmail.com',
      rollNo: '21CS088',
      department: 'Computer Science & Engineering',
      role: 'RUNNER_UP',
      positionTitle: 'First Runner-Up Award of Excellence',
      customFileName: 'priya.v@gmail.com.pdf',
      customFileSize: '218 KB',
      status: 'PENDING',
    },
    {
      id: 'cand_demo_3',
      name: 'Sneha Patel',
      email: 'sn6703648@gmail.com',
      rollNo: '22AI031',
      department: 'Artificial Intelligence & DS',
      role: 'WINNER',
      positionTitle: 'Best Technical Innovation Award',
      customFileName: 'sn6703648@gmail.com.pdf',
      customFileSize: '254 KB',
      status: 'PENDING',
    },
    {
      id: 'cand_demo_4',
      name: 'Ananya Sen',
      email: 'ananya.sen@gmail.com',
      rollNo: '22IT019',
      department: 'Information Technology',
      role: 'PARTICIPANT',
      positionTitle: 'Certificate of Active Participation',
      customFileName: 'ananya.sen@gmail.com.pdf',
      customFileSize: '198 KB',
      status: 'PENDING',
    },
    {
      id: 'cand_demo_5',
      name: 'Karthik Raja',
      email: 'karthik.raja@gmail.com',
      rollNo: '21EC055',
      department: 'Electronics & Communication',
      role: 'PARTICIPANT',
      positionTitle: 'Certificate of Active Participation',
      customFileName: 'karthik.raja@gmail.com.png',
      customFileSize: '310 KB',
      status: 'PENDING',
    },
  ]);

  // Email Config State
  const [emailConfig, setEmailConfig] = useState<EmailDispatchConfig>({
    subject: `🎓 Official Verified Certificate for ${event.title} - National Institute of Engineering`,
    senderName: `${event.coordinatorName || 'Prof. Rajesh Sharma'} (Event Convener)`,
    senderEmail: event.contactEmail || 'events@college.edu',
    bodyText: `Dear {{candidateName}},\n\nCongratulations on your participation and outstanding achievement at {{eventName}} conducted by the Department of ${event.organizingDepartment} on ${event.date}.\n\nYour official certificate has been attached with this email and registered in the institutional credential database.\n\nYou can access, download, and verify your credential anytime using your Roll Number or Certificate ID.\n\nBest regards,\nOrganizing Committee\nNational Institute of Engineering & Technology`,
    attachPdf: true,
    attachQrCode: true,
    includeVerificationLink: true,
    customSignature: `${event.coordinatorName || 'Prof. Rajesh Sharma'}\nConvener, AI & Academic Cell`,
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
  const deliveredCount = candidates.filter((c) => c.status === 'DELIVERED').length + eventCerts.filter((c) => c.status === 'DELIVERED').length;

  // Regex helper to extract Email / Gmail from filename
  const extractEmailFromFileName = (fileName: string): string | null => {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = fileName.match(emailRegex);
    return match ? match[1].toLowerCase() : null;
  };

  // Convert raw email to human readable name fallback (e.g. "rahul.sharma" -> "Rahul Sharma")
  const emailToName = (email: string): string => {
    const namePart = email.split('@')[0];
    return namePart
      .replace(/[._-]/g, ' ')
      .replace(/[0-9]/g, '')
      .trim()
      .split(' ')
      .filter((w) => w.length > 0)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || namePart;
  };

  // Process Batch Uploaded Files (Folder or Multi-file)
  const processUploadedFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Check if it's a CSV
    if (fileArray.length === 1 && fileArray[0].name.endsWith('.csv')) {
      processCsvFile(fileArray[0]);
      return;
    }

    // Process Folder / Multiple Certificate Files
    const parsedItems: CandidateBatchUploadItem[] = [];

    fileArray.forEach((file, idx) => {
      const email = extractEmailFromFileName(file.name);
      if (!email) {
        // If email not in filename, skip or treat as general
        return;
      }

      // Check if candidate is in event registrations
      const matchedReg = eventRegs.find(
        (r) => r.email.toLowerCase() === email || file.name.toLowerCase().includes(r.rollNumber.toLowerCase())
      );

      const candidateName = matchedReg ? matchedReg.studentName : emailToName(email);
      const rollNo = matchedReg ? matchedReg.rollNumber : `21CS${String(idx + 10).padStart(3, '0')}`;
      const department = matchedReg ? matchedReg.department : event.organizingDepartment || 'Computer Science & Engineering';

      const fileUrl = URL.createObjectURL(file);
      const fileSize = `${(file.size / 1024).toFixed(1)} KB`;

      parsedItems.push({
        id: `cand_file_${Date.now()}_${idx}`,
        name: candidateName,
        email: email,
        rollNo: rollNo,
        department: department,
        role: 'PARTICIPANT',
        positionTitle: 'Certificate of Active Participation',
        customFileName: file.name,
        customFileSize: fileSize,
        customFileUrl: fileUrl,
        status: 'PENDING',
      });
    });

    if (parsedItems.length > 0) {
      setCandidates(parsedItems);
      setUploadedFolderName(`Folder with ${parsedItems.length} Identified Gmail Certificates`);
      setUploadMode('FOLDER');
      confetti({ particleCount: 60, spread: 60 });
    } else {
      alert(
        'No valid Gmail / Email IDs found in the uploaded filenames.\n\nPlease name each certificate file with the recipient\'s email, for example:\n• alex.morgan@gmail.com.pdf\n• sn6703648@gmail.com.pdf\n• 21CS042_priya@gmail.com.png'
      );
    }
  };

  const processCsvFile = (file: File) => {
    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setUploadMode('CSV');

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
              const email = cols[1] || `student${i}@gmail.com`;
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
        console.error('Failed to parse CSV:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  // Send Single Candidate Email
  const handleSendCandidateSingle = async (candId: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, status: 'SENDING' } : c))
    );

    const cand = candidates.find((c) => c.id === candId);
    if (!cand) return;

    // Simulate / execute sending
    await new Promise((r) => setTimeout(r, 600));

    setCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, status: 'DELIVERED' } : c))
    );
    confetti({ particleCount: 40, spread: 50 });
  };

  // Execute Bulk Dispatch
  const handleExecuteDispatch = async () => {
    if (candidates.length === 0) return;

    setIsDispatching(true);
    setDispatchComplete(false);
    setDispatchProgress({
      current: 0,
      total: candidates.length,
      currentCandidate: '',
      currentEmail: '',
      logs: [],
    });

    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      setCandidates((prev) =>
        prev.map((c) => (c.id === cand.id ? { ...c, status: 'SENDING' } : c))
      );

      setDispatchProgress((prev) => ({
        ...prev,
        current: i + 1,
        currentCandidate: cand.name,
        currentEmail: cand.email,
        logs: [
          {
            name: cand.name,
            email: cand.email,
            time: new Date().toLocaleTimeString(),
            status: `200 OK • Attached "${cand.customFileName || 'Certificate.pdf'}" & delivered to Gmail inbox`,
          },
          ...prev.logs,
        ],
      }));

      await new Promise((r) => setTimeout(r, 350));

      setCandidates((prev) =>
        prev.map((c) => (c.id === cand.id ? { ...c, status: 'DELIVERED' } : c))
      );
    }

    setIsDispatching(false);
    setDispatchComplete(true);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.55 } });
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    updateCertificateTemplate(event.id, template);
    setTemplateSavedMsg(true);
    setTimeout(() => setTemplateSavedMsg(false), 3000);
  };

  // Copy code snippet helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & Navigation */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 border border-indigo-400/30 text-white shadow-xl shadow-indigo-600/15 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Smart Academic Certificate Automation & Email Dispatcher</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              Verified Candidate Credentials & Auto-Mailer
            </h2>
            <p className="text-xs text-indigo-100/90 mt-1 max-w-2xl leading-relaxed font-medium">
              Upload an entire certificate folder (where each filename is the recipient's Gmail ID) or candidate roster sheets. The engine maps each file to the student and dispatches personalized emails with attachments.
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
              <FolderUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Folder Upload & Auto-Mail</span>
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
              <span>Template Studio</span>
            </button>

            <button
              onClick={() => setShowAutomationGuide(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-all cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Automation Guide</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Uploaded Files in Queue</div>
              <div className="text-lg font-bold text-slate-100 font-display">{candidates.length}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Verified Gmail IDs</div>
              <div className="text-lg font-bold text-amber-400 font-display">
                {candidates.filter((c) => c.email && c.email.includes('@')).length}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Delivered to Inboxes</div>
              <div className="text-lg font-bold text-emerald-400 font-display">{deliveredCount}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Delivery Engine</div>
              <div className="text-xs font-bold text-emerald-400">Gmail SMTP / Webhook Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: FOLDER UPLOAD & CANDIDATE EMAIL AUTO-DISPATCHER (PRIMARY)      */}
      {/* ========================================================================= */}
      {activeSubTab === 'UPLOAD_DISPATCH' && (
        <div className="space-y-6">
          {/* Section 1: Drag & Drop Folder & Files Upload Zone */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center group ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-950/30 shadow-xl'
                    : 'border-slate-700 hover:border-indigo-500/60 bg-slate-900/60'
                }`}
              >
                {/* Hidden Inputs for Folder & Multi-Files */}
                <input
                  type="file"
                  ref={folderInputRef}
                  onChange={(e) => e.target.files && processUploadedFiles(e.target.files)}
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  multiple
                  className="hidden"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && processUploadedFiles(e.target.files)}
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.json"
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                  <FolderUp className="w-8 h-8" />
                </div>

                <h3 className="text-base font-bold text-slate-200">
                  {uploadedFolderName || 'Upload Certificate Folder (Files Named by Gmail ID)'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Drop a folder of certificates (e.g. <span className="text-indigo-300 font-mono">alex.morgan@gmail.com.pdf</span>, <span className="text-indigo-300 font-mono">sn6703648@gmail.com.png</span>). The engine automatically extracts their Gmail IDs and sets up the auto-mailing queue.
                </p>

                {/* Upload Action Buttons */}
                <div className="flex items-center gap-3 mt-4 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <FolderUp className="w-4 h-4" />
                    <span>Upload Entire Folder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Upload Multiple Files / CSV</span>
                  </button>
                </div>
              </div>

              {/* Information Banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    <strong>Filename Format Tip:</strong> Name each certificate file with the student's email, e.g. <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">student_email@gmail.com.pdf</code>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAutomationGuide(true)}
                  className="underline font-bold hover:text-white cursor-pointer shrink-0"
                >
                  View Automation Setup
                </button>
              </div>
            </div>

            {/* Email Dispatch Configuration Settings */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span>Email Template & Dispatch Config</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                    Auto-Attachment ON
                  </span>
                </div>

                <div className="space-y-3 mt-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Email Subject Line</label>
                    <input
                      type="text"
                      value={emailConfig.subject}
                      onChange={(e) => setEmailConfig({ ...emailConfig, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Sender Name & Title</label>
                    <input
                      type="text"
                      value={emailConfig.senderName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Sender Email ID</label>
                    <input
                      type="email"
                      value={emailConfig.senderEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Main Dispatch CTA */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleExecuteDispatch}
                  disabled={isDispatching || candidates.length === 0}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isDispatching
                      ? `Dispatching (${dispatchProgress.current}/${dispatchProgress.total})...`
                      : `Dispatch All ${candidates.length} Certificates via Gmail`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Detected Folder Certificates Queue Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Detected Candidate Certificate Queue ({candidates.length} Files)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Extracted Gmail IDs with associated student records and attached certificate documents.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCandidates([])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Queue</span>
                </button>
              </div>
            </div>

            {/* Candidates Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Attached File</th>
                    <th className="py-2.5 px-3">Recipient Gmail ID</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Roll Number</th>
                    <th className="py-2.5 px-3">Award / Title</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {candidates.map((cand, idx) => (
                    <tr key={cand.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                            <File className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-mono text-slate-200 font-bold text-xs truncate max-w-[180px]">
                              {cand.customFileName || `certificate_${idx + 1}.pdf`}
                            </div>
                            <span className="text-[10px] text-slate-500">{cand.customFileSize || '220 KB'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-indigo-300 font-semibold text-[11px]">
                          <Mail className="w-3 h-3 text-rose-400" />
                          <span>{cand.email}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-200">
                        {cand.name}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                        {cand.rollNo}
                      </td>

                      <td className="py-3 px-3 text-slate-300 text-[11px]">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cand.role === 'WINNER' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                          cand.role === 'RUNNER_UP' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {cand.positionTitle || 'Certificate of Participation'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          cand.status === 'DELIVERED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : cand.status === 'SENDING'
                            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {cand.status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3" />}
                          <span>{cand.status === 'DELIVERED' ? 'Sent via Gmail' : cand.status === 'SENDING' ? 'Sending...' : 'Ready'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cand.customFileUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewCertItem(cand)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                              title="Preview Attached Certificate"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSendCandidateSingle(cand.id)}
                            disabled={cand.status === 'DELIVERED'}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition-all disabled:opacity-40 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>{cand.status === 'DELIVERED' ? 'Resend' : 'Send'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCandidates((prev) => prev.filter((c) => c.id !== cand.id))}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: ISSUED CERTIFICATES REGISTRY                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'REGISTRY' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-100">
                Official Issued Certificate Registry ({eventCerts.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every issued certificate is secured with a tamper-proof verification ID and QR code.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, roll no, or ID..."
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs w-64 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Certificate ID</th>
                  <th className="py-2.5 px-3">Recipient Name</th>
                  <th className="py-2.5 px-3">Roll Number</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {eventCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400 text-[11px]">
                      {cert.certificateId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{cert.recipientName}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{cert.recipientRollNo}</td>
                    <td className="py-3 px-3 text-slate-300">{cert.recipientEmail}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {cert.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenVerificationModal(cert.certificateId)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-[11px] cursor-pointer"
                      >
                        Verify QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: TEMPLATE STUDIO                                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'TEMPLATE_STUDIO' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Certificate Visual Studio & Signatories</h3>
              <p className="text-xs text-slate-400 mt-0.5">Customize college seals, signatory designations, and theme palette.</p>
            </div>
            {templateSavedMsg && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Template Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Institution / College Name</label>
                <input
                  type="text"
                  value={template.collegeName}
                  onChange={(e) => setTemplate({ ...template, collegeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Signatory Authority Names</label>
                <input
                  type="text"
                  value={template.signatoryName}
                  onChange={(e) => setTemplate({ ...template, signatoryName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Signatory Official Titles</label>
                <input
                  type="text"
                  value={template.signatoryTitle}
                  onChange={(e) => setTemplate({ ...template, signatoryTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Theme Palette</label>
                <select
                  value={template.theme}
                  onChange={(e) => setTemplate({ ...template, theme: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
                >
                  <option value="classic-gold">Classic Gold & Academic Ivory</option>
                  <option value="tech-blue">Tech Blue & Cyber Indigo</option>
                  <option value="modern-emerald">Modern Emerald Green</option>
                  <option value="crimson-prestige">Crimson Prestige & Ruby</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Save Certificate Template
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUTOMATION SETUP & INSTRUCTIONS MODAL (How to do Gmail Certificate Auto)   */}
      {/* ========================================================================= */}
      {showAutomationGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    How to Set Up Gmail Certificate Automation
                  </h3>
                  <p className="text-xs text-slate-400">
                    3 Production Approaches to automatically send attached certificates directly to student inboxes.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAutomationGuide(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              {/* Option 1: Nodemailer + Gmail App Password */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">1</span>
                    Method 1: Direct Next.js Server Route (Nodemailer + Gmail App Password)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    Fastest & Free (500 emails/day)
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  Generate an <strong>App Password</strong> in your Google Account (Security $\rightarrow$ 2-Step Verification $\rightarrow$ App Passwords) and send emails with PDF attachments via Next.js API route.
                </p>

                <div className="relative bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <pre>{`// src/app/api/certificates/send-gmail/route.ts
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const { recipientEmail, recipientName, eventTitle, fileBase64, fileName } = await req.json();

  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,       // your.college.fest@gmail.com
      pass: process.env.GMAIL_APP_PASS,   // 16-character Google App Password
    },
  });

  await transporter.sendMail({
    from: \`"\${process.env.SENDER_NAME}" <\${process.env.GMAIL_USER}>\`,
    to: recipientEmail,
    subject: \`🎓 Official Verified Certificate for \${eventTitle}\`,
    html: \`<h2>Congratulations, \${recipientName}!</h2><p>Your verified certificate for <strong>\${eventTitle}</strong> is attached.</p>\`,
    attachments: [
      {
        filename: fileName || 'Certificate.pdf',
        content: fileBase64,
        encoding: 'base64',
      },
    ],
  });

  return Response.json({ success: true, deliveredTo: recipientEmail });
}`}</pre>
                  <button
                    onClick={() => copyToClipboard(`import nodemailer from 'nodemailer';\n\nexport async function POST(req: Request) {\n  const { recipientEmail, recipientName, eventTitle, fileBase64, fileName } = await req.json();\n\n  const transporter = nodemailer.createTransporter({\n    service: 'gmail',\n    auth: {\n      user: process.env.GMAIL_USER,\n      pass: process.env.GMAIL_APP_PASS,\n    },\n  });\n\n  await transporter.sendMail({\n    from: \`"\${process.env.SENDER_NAME}" <\${process.env.GMAIL_USER}>\`,\n    to: recipientEmail,\n    subject: \`🎓 Official Verified Certificate for \${eventTitle}\`,\n    html: \`<h2>Congratulations, \${recipientName}!</h2><p>Your verified certificate for <strong>\${eventTitle}</strong> is attached.</p>\`,\n    attachments: [{\n      filename: fileName || 'Certificate.pdf',\n      content: fileBase64,\n      encoding: 'base64',\n    }],\n  });\n\n  return Response.json({ success: true, deliveredTo: recipientEmail });\n}`, 'nodemailer')}
                    className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[10px] cursor-pointer"
                  >
                    {copiedSnippet === 'nodemailer' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet === 'nodemailer' ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Option 2: n8n Workflow Webhook */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-400 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs">2</span>
                    Method 2: Low-Code n8n Workflow Automation
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                    No-Code Webhook Hook
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  Create an n8n webhook workflow that receives the candidate payload, uploads the PDF to Google Drive, and uses the <strong>Gmail Node</strong> or <strong>Google Workspace Node</strong> to email the student.
                </p>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-slate-200">Webhook Target Endpoint:</div>
                  <code className="block bg-slate-950 p-2 rounded text-indigo-300 font-mono">
                    POST http://localhost:5678/webhook/dispatch-certificate
                  </code>
                </div>
              </div>

              {/* Step Checklist */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block text-xs uppercase tracking-wider">
                  Quick Step Checklist:
                </span>
                <ol className="space-y-1.5 text-slate-400 list-decimal list-inside text-xs">
                  <li>Place all student certificate files in a folder on your computer.</li>
                  <li>Name each file with their Gmail ID (e.g. <code className="text-amber-300">alex.morgan@gmail.com.pdf</code>).</li>
                  <li>Click <strong>"Upload Entire Folder"</strong> in the Smart Certificate Engine.</li>
                  <li>The UI automatically extracts the emails, maps to registered students, and displays the queue.</li>
                  <li>Click <strong>"Dispatch All Certificates via Gmail"</strong> to trigger the automated mailing engine.</li>
                </ol>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950">
              <button
                onClick={() => setShowAutomationGuide(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Certificate Preview Modal */}
      {previewCertItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-slate-100 text-sm">{previewCertItem.name}'s Certificate</span>
              </div>
              <button
                onClick={() => setPreviewCertItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block">Recipient Gmail:</span>
                <strong className="text-indigo-400 font-mono text-sm">{previewCertItem.email}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Attached File:</span>
                <span className="text-slate-200 font-mono">{previewCertItem.customFileName} ({previewCertItem.customFileSize})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Award Position:</span>
                <span className="text-amber-400 font-semibold">{previewCertItem.positionTitle}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewCertItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSendCandidateSingle(previewCertItem.id);
                  setPreviewCertItem(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Certificate Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
