import React, { useState, useRef, useEffect } from 'react';
import { EventItem, CertificateCampaign, CertificateCampaignRecipient } from '@/types';
import {
  FolderUp,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  Send,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Mail,
  ShieldCheck,
  FileText,
  Trash2,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ParsedRecipientFile {
  id: string;
  name: string;
  email: string;
  fileName: string;
  file?: File;
  fileUrl?: string;
  fileKey?: string;
  status: 'READY' | 'INVALID' | 'PENDING' | 'SENDING' | 'SENT' | 'FAILED';
  invalidReason?: string;
  error?: string;
  sentAt?: string;
}

interface CertificateDistributionProps {
  event: EventItem;
  organizerId?: string;
  onCampaignComplete?: (campaign: CertificateCampaign) => void;
}

export const CertificateDistribution: React.FC<CertificateDistributionProps> = ({
  event,
  organizerId,
  onCampaignComplete,
}) => {
  // Upload and parsing states
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<ParsedRecipientFile[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VALID' | 'INVALID' | 'SENT' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Email template & webhook config
  const [eventName, setEventName] = useState(event.title);
  const [emailSubject, setEmailSubject] = useState(`Your Certificate - {{event_name}}`);
  const [emailMessage, setEmailMessage] = useState(
    `Hi {{name}},\n\nCongratulations on participating in {{event_name}}.\n\nPlease find your certificate attached.\n\nBest regards,\nEvent Organizing Team`
  );
  const [webhookUrl, setWebhookUrl] = useState<string>('https://pradeepsekar.app.n8n.cloud/webhook/certificate-mailer');

  // Execution & Live Progress states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<CertificateCampaign | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Parse a single file strictly according to the specified rule: Name__email@gmail.com.pdf
  const parseCertificateFile = (file: File, index: number): ParsedRecipientFile => {
    const fileName = file.name;
    const isPdf = /\.pdf$/i.test(fileName);

    if (!isPdf) {
      return {
        id: `file_${Date.now()}_${index}`,
        name: '-',
        email: '-',
        fileName,
        file,
        status: 'INVALID',
        invalidReason: 'Only .pdf files are supported',
      };
    }

    const baseName = fileName.replace(/\.pdf$/i, '');
    if (!baseName.includes('__')) {
      return {
        id: `file_${Date.now()}_${index}`,
        name: '-',
        email: '-',
        fileName,
        file,
        status: 'INVALID',
        invalidReason: 'Expected format Name__email@gmail.com.pdf',
      };
    }

    const parts = baseName.split('__');
    const rawName = parts[0] || '';
    const rawEmail = parts.slice(1).join('__'); // in case of extra double underscores

    const cleanName = rawName.trim();
    const cleanEmail = rawEmail.trim().toLowerCase();

    if (!cleanName) {
      return {
        id: `file_${Date.now()}_${index}`,
        name: '-',
        email: cleanEmail || '-',
        fileName,
        file,
        status: 'INVALID',
        invalidReason: 'Participant name is missing before __',
      };
    }

    if (!cleanEmail) {
      return {
        id: `file_${Date.now()}_${index}`,
        name: cleanName,
        email: '-',
        fileName,
        file,
        status: 'INVALID',
        invalidReason: 'Email is missing after __',
      };
    }

    // Email RFC validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return {
        id: `file_${Date.now()}_${index}`,
        name: cleanName,
        email: cleanEmail,
        fileName,
        file,
        status: 'INVALID',
        invalidReason: 'Invalid email address format',
      };
    }

    return {
      id: `file_${Date.now()}_${index}`,
      name: cleanName,
      email: cleanEmail,
      fileName,
      file,
      status: 'READY',
    };
  };

  // Process files from Folder or Multiple selection
  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Detect folder name if available via webkitRelativePath
    const firstRel = (fileArray[0] as any).webkitRelativePath;
    if (firstRel && firstRel.includes('/')) {
      const folder = firstRel.split('/')[0];
      setSelectedFolderName(folder);
    } else {
      setSelectedFolderName(`Selected Batch (${fileArray.length} files)`);
    }

    const parsed = fileArray.map((file, idx) => parseCertificateFile(file, idx));

    // Detect duplicate emails in the same batch and flag them
    const emailCounts = new Map<string, number>();
    parsed.forEach((p) => {
      if (p.status === 'READY') {
        const count = emailCounts.get(p.email) || 0;
        emailCounts.set(p.email, count + 1);
      }
    });

    const validated = parsed.map((p) => {
      if (p.status === 'READY' && (emailCounts.get(p.email) || 0) > 1) {
        return {
          ...p,
          status: 'INVALID' as const,
          invalidReason: 'Duplicate email detected in batch',
        };
      }
      return p;
    });

    setRecipients(validated);
    setActiveCampaignId(null);
    setCampaign(null);
    setIsPolling(false);
    setStatusMessage(null);

    const validCount = validated.filter((p) => p.status === 'READY').length;
    if (validCount > 0) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Upload PDFs to private Next.js storage & trigger n8n distribution
  const handleStartDistribution = async () => {
    const validRecipients = recipients.filter((r) => r.status === 'READY' && r.file);
    if (validRecipients.length === 0) {
      alert('No valid certificate files available to distribute.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgressText(`Uploading ${validRecipients.length} certificates to private storage...`);

    try {
      // Step 1: Upload PDFs via FormData to POST /api/certificates/upload
      const formData = new FormData();
      validRecipients.forEach((r) => {
        if (r.file) {
          formData.append('files', r.file, r.fileName);
        }
      });

      const uploadRes = await fetch('/api/certificates/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error(`Storage upload failed with status ${uploadRes.status}`);
      }

      const uploadData = await uploadRes.json();
      if (!uploadData.ok || !uploadData.uploadedFiles) {
        throw new Error(uploadData.error || 'Failed to upload certificate files');
      }

      setUploadProgressText('Generating secure signed URLs and triggering n8n mailer...');

      // Map uploaded files to recipients
      const uploadedMap = new Map<string, { fileUrl: string; fileKey: string }>();
      uploadData.uploadedFiles.forEach((u: any) => {
        uploadedMap.set(u.fileName.toLowerCase(), { fileUrl: u.fileUrl, fileKey: u.fileKey });
      });

      const recipientsPayload = validRecipients.map((r) => {
        const match = uploadedMap.get(r.fileName.toLowerCase());
        return {
          name: r.name,
          email: r.email,
          fileName: r.fileName,
          fileUrl: match?.fileUrl || '',
          fileKey: match?.fileKey || '',
        };
      });

      // Step 2: Trigger Next.js backend send API: POST /api/certificates/send
      const sendRes = await fetch('/api/certificates/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          eventName: eventName || event.title,
          organizerId,
          subject: emailSubject,
          message: emailMessage,
          webhookUrl: webhookUrl || undefined,
          recipients: recipientsPayload,
        }),
      });

      const sendData = await sendRes.json();
      if (!sendData.ok || !sendData.campaignId) {
        throw new Error(sendData.error || 'Failed to dispatch campaign');
      }

      setActiveCampaignId(sendData.campaignId);
      setIsPolling(true);
      setUploadProgressText(null);
      setIsSubmitting(false);

      // Initialize local campaign view
      const initialCampaign: CertificateCampaign = {
        id: sendData.campaignId,
        eventId: event.id,
        eventName: eventName || event.title,
        subject: emailSubject,
        message: emailMessage,
        total: validRecipients.length,
        sent: 0,
        failed: 0,
        pending: validRecipients.length,
        status: 'SENDING',
        failedFiles: [],
        createdAt: new Date().toISOString(),
      };
      setCampaign(initialCampaign);

      // Update recipient statuses in table
      setRecipients((prev) =>
        prev.map((r) => {
          if (r.status === 'READY') {
            const match = uploadedMap.get(r.fileName.toLowerCase());
            return {
              ...r,
              status: 'PENDING',
              fileUrl: match?.fileUrl,
              fileKey: match?.fileKey,
            };
          }
          return r;
        })
      );
    } catch (err: any) {
      console.error('Distribution dispatch failed:', err);
      alert(`Error starting distribution: ${err?.message || err}`);
      setIsSubmitting(false);
      setUploadProgressText(null);
    }
  };

  // Poll campaign status from server API every 1 second
  useEffect(() => {
    if (!activeCampaignId || !isPolling) return;

    let isMounted = true;
    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/certificates/campaign/${activeCampaignId}`);
        if (!res.ok) return;

        const data = await res.json();
        if (data.ok && data.campaign && isMounted) {
          const updatedCampaign: CertificateCampaign = data.campaign;
          setCampaign(updatedCampaign);

          // Update individual recipient statuses
          if (updatedCampaign.recipients && updatedCampaign.recipients.length > 0) {
            const serverRecMap = new Map<string, CertificateCampaignRecipient>();
            updatedCampaign.recipients.forEach((sr) => {
              serverRecMap.set(sr.email.toLowerCase(), sr);
            });

            setRecipients((prev) =>
              prev.map((r) => {
                const matched = serverRecMap.get(r.email.toLowerCase());
                if (matched) {
                  return {
                    ...r,
                    status: matched.status,
                    error: matched.error,
                    sentAt: matched.sentAt,
                  };
                }
                return r;
              })
            );
          }

          // Check if campaign reached terminal state
          if (updatedCampaign.pending === 0 && (updatedCampaign.status === 'COMPLETED' || updatedCampaign.status === 'FAILED')) {
            setIsPolling(false);
            if (updatedCampaign.sent > 0) {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
            }
            if (onCampaignComplete) {
              onCampaignComplete(updatedCampaign);
            }
          }
        }
      } catch (pollErr) {
        console.warn('Polling campaign status failed:', pollErr);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeCampaignId, isPolling, onCampaignComplete]);

  // Retry ONLY failed recipients
  const handleRetryFailed = async () => {
    if (!activeCampaignId) return;

    setIsRetrying(true);
    try {
      const res = await fetch(`/api/certificates/campaign/${activeCampaignId}/retry`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to trigger retry');
      }

      setStatusMessage(`Retrying ${data.retriedCount} failed certificate(s)...`);
      setIsPolling(true);

      // Update local state: mark failed items as SENDING
      setRecipients((prev) =>
        prev.map((r) => (r.status === 'FAILED' ? { ...r, status: 'SENDING', error: undefined } : r))
      );
    } catch (err: any) {
      alert(`Retry failed: ${err?.message || err}`);
    } finally {
      setIsRetrying(false);
    }
  };

  // Reset distribution flow
  const handleReset = () => {
    if (campaign && campaign.status === 'SENDING' && !confirm('A campaign is currently sending. Are you sure you want to reset?')) {
      return;
    }
    setRecipients([]);
    setSelectedFolderName(null);
    setActiveCampaignId(null);
    setCampaign(null);
    setIsPolling(false);
    setStatusMessage(null);
  };

  // Computed statistics
  const totalFiles = recipients.length;
  const validFiles = recipients.filter((r) => r.status === 'READY').length;
  const invalidFiles = recipients.filter((r) => r.status === 'INVALID').length;
  const sentCount = recipients.filter((r) => r.status === 'SENT').length;
  const failedCount = recipients.filter((r) => r.status === 'FAILED').length;
  const pendingCount = recipients.filter((r) => r.status === 'PENDING' || r.status === 'SENDING').length;

  const failedRecipientsList = recipients.filter((r) => r.status === 'FAILED');

  // Filtered recipient list for display
  const filteredRecipients = recipients.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'VALID') return r.status === 'READY' || r.status === 'SENT' || r.status === 'PENDING' || r.status === 'SENDING';
    if (filterStatus === 'INVALID') return r.status === 'INVALID';
    if (filterStatus === 'SENT') return r.status === 'SENT';
    if (filterStatus === 'FAILED') return r.status === 'FAILED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Title Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 text-white shadow-xl shadow-indigo-600/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Smart Certificate Mailer Automation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
              Folder-Based Certificate Distribution
            </h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl">
              Upload a folder of candidate certificates (<code className="text-amber-300">Name__email@gmail.com.pdf</code>).
              Next.js parses recipients, uploads to private temporary storage, and triggers the n8n Gmail workflow.
            </p>
          </div>

          {totalFiles > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 cursor-pointer self-start sm:self-center"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>New Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Folder Upload Dropzone (When no files selected or wanting to pick new) */}
      {totalFiles === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-indigo-500 bg-indigo-950/30 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
          }`}
          onClick={() => folderInputRef.current?.click()}
        >
          <input
            ref={folderInputRef}
            type="file"
            /* @ts-ignore */
            webkitdirectory="true"
            directory="true"
            multiple
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFilesSelected(e.target.files);
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFilesSelected(e.target.files);
            }}
          />

          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
              <FolderUp className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200">
                Select Entire Certificate Folder
              </h3>
              <p className="text-xs text-slate-400">
                Drag and drop your folder here or click to browse. Standard format:
              </p>
              <div className="mt-2 inline-block px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300">
                Name__email@gmail.com.pdf
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  folderInputRef.current?.click();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <FolderUp className="w-4 h-4" />
                <span>Select Folder</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Select Multiple Files</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Live Campaign Progress Card (When campaign is active or completed) */}
      {campaign && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    campaign.status === 'COMPLETED'
                      ? 'bg-emerald-400'
                      : campaign.status === 'SENDING'
                      ? 'bg-indigo-400 animate-ping'
                      : 'bg-rose-400'
                  }`}
                />
                <h3 className="text-base font-bold text-slate-100">
                  {campaign.status === 'COMPLETED'
                    ? 'Certificate Distribution Completed'
                    : campaign.status === 'SENDING'
                    ? 'Sending Certificates via n8n'
                    : 'Certificate Distribution Finished with Errors'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Campaign ID: <code className="text-indigo-300 font-mono">{campaign.id}</code> • Event: {campaign.eventName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {campaign.failed > 0 && campaign.status !== 'SENDING' && (
                <button
                  onClick={handleRetryFailed}
                  disabled={isRetrying}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>Retry {campaign.failed} Failed</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Delivery Progress</span>
              <span className="font-bold text-slate-200">
                {campaign.sent} / {campaign.total} sent ({Math.round((campaign.sent / (campaign.total || 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round(((campaign.sent + campaign.failed) / (campaign.total || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Real-time Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
              <span className="text-lg font-bold text-slate-100">{campaign.total}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Sent</span>
              <span className="text-lg font-bold text-emerald-400">{campaign.sent}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block">Pending</span>
              <span className="text-lg font-bold text-indigo-400">{campaign.pending}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">Failed</span>
              <span className="text-lg font-bold text-rose-400">{campaign.failed}</span>
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* 4. Batch Preview & Email Configuration Area (When files are loaded) */}
      {totalFiles > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Recipient Validation & Preview Table */}
          <div className="lg:col-span-2 space-y-4">
            {/* Batch Stats Summary Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FolderUp className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-slate-200 text-xs">
                  {selectedFolderName || 'Selected Certificates'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-mono">
                  {totalFiles} PDFs
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {campaign ? `${sentCount} Sent` : `${validFiles} Valid`}
                </span>
                {(invalidFiles > 0 || failedCount > 0) && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 border border-rose-500/30 text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {campaign ? `${failedCount} Failed` : `${invalidFiles} Invalid`}
                  </span>
                )}
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by candidate name, email, or filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                {(['ALL', 'VALID', 'INVALID'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      filterStatus === st ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st === 'ALL' ? 'All Files' : st === 'VALID' ? 'Valid' : 'Invalid'}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients Preview Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Filename</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Reason / Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRecipients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        No files matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecipients.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-200">{rec.name}</td>
                        <td className="p-3.5 font-mono text-indigo-300">{rec.email}</td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-400 max-w-[180px] truncate" title={rec.fileName}>
                          {rec.fileName}
                        </td>
                        <td className="p-3.5">
                          {rec.status === 'READY' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                              READY
                            </span>
                          )}
                          {rec.status === 'INVALID' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 border border-rose-500/30 text-rose-400">
                              INVALID
                            </span>
                          )}
                          {rec.status === 'PENDING' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                              PENDING
                            </span>
                          )}
                          {rec.status === 'SENDING' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 border border-indigo-500/30 text-indigo-300 flex items-center gap-1 w-fit">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              SENDING
                            </span>
                          )}
                          {rec.status === 'SENT' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 w-fit">
                              <Check className="w-3 h-3" />
                              SENT
                            </span>
                          )}
                          {rec.status === 'FAILED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 border border-rose-500/40 text-rose-400 flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" />
                              FAILED
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-[11px]">
                          {rec.invalidReason && (
                            <span className="text-rose-400">{rec.invalidReason}</span>
                          )}
                          {rec.error && (
                            <span className="text-rose-400">{rec.error}</span>
                          )}
                          {rec.status === 'SENT' && (
                            <span className="text-emerald-400">Delivered via n8n</span>
                          )}
                          {!rec.invalidReason && !rec.error && rec.status !== 'SENT' && (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Failed Files Breakdown Accordion / Section */}
            {failedRecipientsList.length > 0 && (
              <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>Failed Recipients Breakdown ({failedRecipientsList.length})</span>
                  </div>
                  <button
                    onClick={handleRetryFailed}
                    disabled={isRetrying}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>Retry Failed Only</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {failedRecipientsList.map((f, i) => (
                    <div key={f.id} className="p-3 rounded-xl bg-slate-950 border border-rose-500/20 text-xs flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-200">
                          {i + 1}. {f.name} ({f.email})
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">{f.fileName}</div>
                      </div>
                      <span className="text-rose-400 text-right font-medium">
                        {f.error || 'Delivery failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right 1 Col: Email Configuration & Send Dispatcher */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Mail className="w-4 h-4" />
                <span>Configure Email Template</span>
              </div>

              {/* Event Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Event Name</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Ignite 2026"
                  disabled={isSubmitting || (campaign?.status === 'SENDING')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Subject Line */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Email Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Your Certificate - {{event_name}}"
                  disabled={isSubmitting || (campaign?.status === 'SENDING')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* n8n Webhook URL Target */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300">n8n Webhook URL</label>
                  <span className="text-[10px] text-emerald-400 font-mono">Live / Test</span>
                </div>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://pradeepsekar.app.n8n.cloud/webhook/certificate-mailer"
                  disabled={isSubmitting || (campaign?.status === 'SENDING')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-500">
                  Target webhook in your n8n Cloud. Both test (<code className="text-amber-300">/webhook-test/</code>) and live (<code className="text-emerald-300">/webhook/</code>) are dispatched.
                </p>
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300">Greeting / Message</label>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    Supports &#123;&#123;name&#125;&#125;, &#123;&#123;event_name&#125;&#125;
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  disabled={isSubmitting || (campaign?.status === 'SENDING')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                />
              </div>

              {/* Summary of what participant receives */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-[11px] text-slate-400">
                <div className="font-bold text-slate-300">Participant receives:</div>
                <div>• Personalized greeting & message</div>
                <div>• Exact PDF certificate attachment (<code className="text-amber-300">Name__email.pdf</code>)</div>
                <div className="text-[10px] text-slate-500 italic mt-1">
                  Storage URLs and internal webhooks remain strictly private.
                </div>
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={handleStartDistribution}
                disabled={isSubmitting || validFiles === 0 || (campaign?.status === 'SENDING')}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{uploadProgressText || 'Processing...'}</span>
                  </>
                ) : campaign?.status === 'SENDING' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatch In Progress...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send {validFiles} Certificates via n8n</span>
                  </>
                )}
              </button>

              {invalidFiles > 0 && (
                <p className="text-[11px] text-amber-400 text-center">
                  ⚠️ {invalidFiles} invalid file(s) will be automatically skipped.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
