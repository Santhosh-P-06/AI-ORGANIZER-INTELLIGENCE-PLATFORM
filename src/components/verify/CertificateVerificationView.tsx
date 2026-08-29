import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  CheckCircle2,
  XCircle,
  Search,
  QrCode,
  Calendar,
  Building,
  ShieldCheck,
  Download,
  Printer,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateVerificationViewProps {
  initialCertId?: string;
  onBack: () => void;
}

export const CertificateVerificationView: React.FC<CertificateVerificationViewProps> = ({
  initialCertId = 'CERT-TH-2026-8801',
  onBack,
}) => {
  const { certificates, getCertificateById } = useApp();
  const [certInput, setCertInput] = useState(initialCertId);
  const [searchedId, setSearchedId] = useState(initialCertId);

  const cert = getCertificateById(searchedId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certInput.trim()) return;
    setSearchedId(certInput.trim());
    if (getCertificateById(certInput.trim())) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const sampleCertIds = ['CERT-TH-2026-8801', 'CERT-TH-2026-8802', 'CERT-VOL-2026-9901'];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Back */}
        <div className="flex items-center justify-between mb-8 no-print">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main Platform</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Public Verification Portal</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl mb-8 no-print">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100 mb-1 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Institutional Certificate Authenticity Verification</span>
          </h1>
          <p className="text-xs text-slate-400 mb-4">
            Verify academic credentials, winners, and participation records issued by the AI Event Organiser Intelligence System.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                placeholder="Enter unique Certificate ID (e.g. CERT-TH-2026-8801)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer"
            >
              Verify Credential
            </button>
          </form>

          {/* Quick sample chips */}
          <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500">
            <span>Try sample credentials:</span>
            {sampleCertIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setCertInput(id);
                  setSearchedId(id);
                }}
                className="font-mono text-indigo-400 hover:underline hover:text-indigo-300"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Result Card */}
        {cert ? (
          <div className="space-y-6">
            {/* Authenticity Banner */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-300">OFFICIALLY VERIFIED & AUTHENTIC</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold tracking-wider">
                      Tamper-Proof
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Issued and recorded by {cert.templateStyle.collegeName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>

            {/* Visual Certificate Preview Layout */}
            <div className="relative p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-4 border-amber-500/40 shadow-2xl overflow-hidden print-cert">
              {/* Corner Watermarks */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

              {/* Institution Header */}
              <div className="text-center space-y-1 pb-6 border-b border-slate-800">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>{cert.templateStyle.collegeLogoText}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-100 uppercase tracking-wide">
                  {cert.templateStyle.collegeName}
                </h2>
                <p className="text-xs text-slate-400">{cert.templateStyle.signatoryDepartment}</p>
              </div>

              {/* Certificate Type Banner */}
              <div className="text-center my-8">
                <p className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">
                  CERTIFICATE OF {cert.recipientRole}
                </p>
                <p className="text-xs text-slate-400 mb-2">This is to proudly certify that</p>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-100 text-amber-300">
                  {cert.recipientName}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Roll No: <span className="text-slate-200">{cert.recipientRollNo}</span> • Dept: <span className="text-slate-200">{cert.recipientDept}</span>
                </p>
                <p className="text-xs text-slate-300 mt-4 max-w-xl mx-auto leading-relaxed">
                  has actively participated and demonstrated exemplary merit in <span className="font-semibold text-slate-100">"{cert.eventTitle}"</span> held on {cert.eventDate}.
                </p>

                {cert.positionTitle && (
                  <div className="inline-block mt-4 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                    🏆 {cert.positionTitle}
                  </div>
                )}
              </div>

              {/* Footer: Signatures & QR Code */}
              <div className="pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 items-end gap-6 text-center sm:text-left">
                {/* QR Code & ID */}
                <div className="flex flex-col items-center sm:items-start">
                  <div className="w-20 h-20 p-1.5 bg-white rounded-lg shadow-md flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-slate-900" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1.5">
                    ID: {cert.certificateId}
                  </span>
                </div>

                {/* Issue Date */}
                <div className="text-center text-xs text-slate-400">
                  <div className="text-slate-300 font-semibold">{cert.issueDate}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Date of Issuance</div>
                </div>

                {/* Signatory */}
                <div className="text-center sm:text-right">
                  <div className="font-display font-bold text-xs text-slate-200 border-b border-slate-700 pb-1">
                    {cert.templateStyle.signatoryName}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {cert.templateStyle.signatoryTitle}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No Verified Record Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              We could not find an issued certificate with ID <span className="font-mono text-rose-300">"{searchedId}"</span>. Please check the spelling or contact the event organizers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
