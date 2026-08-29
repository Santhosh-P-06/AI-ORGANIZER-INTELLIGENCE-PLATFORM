import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { CertificateVerificationView } from './components/verify/CertificateVerificationView';
import { OrganiserDashboard } from './components/organiser/OrganiserDashboard';
import { VolunteerDashboard } from './components/volunteer/VolunteerDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

const AppContent: React.FC = () => {
  const { currentUser, currentRole } = useApp();

  const [viewState, setViewState] = useState<'AUTH' | 'LANDING' | 'DASHBOARD' | 'VERIFICATION'>('AUTH');
  const [selectedCertIdForVerification, setSelectedCertIdForVerification] = useState<string | undefined>(undefined);

  const handleOpenAuth = () => {
    setViewState('AUTH');
  };

  const handleOpenVerification = (certId?: string) => {
    setSelectedCertIdForVerification(certId || 'CERT-TH-2026-8801');
    setViewState('VERIFICATION');
  };

  if (viewState === 'AUTH') {
    return <LoginPage onSuccess={() => setViewState('DASHBOARD')} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Global Navigation Header */}
      <Header
        onOpenAuth={handleOpenAuth}
        onOpenVerification={() => handleOpenVerification()}
        onGoHome={() => setViewState(currentUser ? 'DASHBOARD' : 'AUTH')}
        onGoDashboard={() => setViewState('DASHBOARD')}
        currentViewState={viewState}
      />

      {/* Main Dynamic Viewports */}
      <main className="flex-1">
        {viewState === 'VERIFICATION' ? (
          <CertificateVerificationView
            initialCertId={selectedCertIdForVerification}
            onBack={() => setViewState(currentUser ? 'DASHBOARD' : 'AUTH')}
          />
        ) : viewState === 'LANDING' ? (
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onOpenVerification={handleOpenVerification}
          />
        ) : (
          <>
            {currentRole === 'ORGANISER' && (
              <OrganiserDashboard
                onOpenVerificationModal={(certId) => handleOpenVerification(certId)}
              />
            )}
            {currentRole === 'VOLUNTEER' && <VolunteerDashboard />}
            {currentRole === 'STUDENT' && (
              <StudentDashboard
                onOpenVerificationModal={(certId) => handleOpenVerification(certId)}
              />
            )}
            {currentRole === 'ADMIN' && <AdminDashboard />}
          </>
        )}
      </main>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
