/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Main Application Orchestrator
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ReceiptModal } from './components/common/ReceiptModal';
import { MobileMoneyModal } from './components/common/MobileMoneyModal';
import { SupabaseModal } from './components/common/SupabaseModal';
import { CreateTontineModal } from './components/common/CreateTontineModal';
import { RecordContributionModal } from './components/common/RecordContributionModal';
import { AddMemberModal } from './components/common/AddMemberModal';
import { RecordExpenseModal } from './components/common/RecordExpenseModal';
import { ViralShareModal } from './components/common/ViralShareModal';
import { LandingView } from './views/LandingView';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { TontinesView } from './views/TontinesView';
import { TontineDetailView } from './views/TontineDetailView';
import { MembersView } from './views/MembersView';
import { ContributionsView } from './views/ContributionsView';
import { BeneficiariesView } from './views/BeneficiariesView';
import { ExpensesView } from './views/ExpensesView';
import { PenaltiesView } from './views/PenaltiesView';
import { ReportsView } from './views/ReportsView';
import { NotificationsView } from './views/NotificationsView';
import { SubscriptionView } from './views/SubscriptionView';
import { SuperAdminView } from './views/SuperAdminView';
import { ProfileSettingsView } from './views/ProfileSettingsView';
import { MonCompteView } from './views/MonCompteView';
import { SupportView } from './views/SupportView';
import { storage } from './services/storage';
import { Receipt, UserProfile, Tontine } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTontineId, setActiveTontineId] = useState<string>(
    storage.getTontines()[0]?.id || ''
  );

  // Global modals
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isMobileMoneyModalOpen, setIsMobileMoneyModalOpen] = useState(false);
  const [momoTarget, setMomoTarget] = useState<{
    tontineId: string;
    memberId: string;
    memberName: string;
  }>({
    tontineId: '',
    memberId: '',
    memberName: '',
  });

  // Global Creation & Record Modals
  const [isCreateTontineModalOpen, setIsCreateTontineModalOpen] = useState(false);
  const [editingTontine, setEditingTontine] = useState<Tontine | null>(null);

  const [isRecordContributionModalOpen, setIsRecordContributionModalOpen] = useState(false);
  const [recordDefaults, setRecordDefaults] = useState<{ tontineId?: string; memberId?: string }>({});

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [addMemberTargetTontineId, setAddMemberTargetTontineId] = useState<string | undefined>(undefined);

  const [isRecordExpenseModalOpen, setIsRecordExpenseModalOpen] = useState(false);

  const [isViralShareOpen, setIsViralShareOpen] = useState(false);
  const [viralShareTontineId, setViralShareTontineId] = useState<string | undefined>(undefined);

  const handleOpenViralShare = (tontineId?: string) => {
    setViralShareTontineId(tontineId || activeTontineId || storage.getTontines()[0]?.id);
    setIsViralShareOpen(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('landing');
  };

  // Notifications badge
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(
    storage.getNotifications().filter((n) => !n.is_read).length
  );

  const refreshNotificationCount = () => {
    setUnreadNotificationsCount(storage.getNotifications().filter((n) => !n.is_read).length);
  };

  // Subscribe to storage changes globally
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      refreshNotificationCount();
    });
    return unsubscribe;
  }, []);

  const handleNavigate = (view: string, params?: { tontineId?: string }) => {
    if (params?.tontineId) {
      setActiveTontineId(params.tontineId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: UserProfile) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleOpenMobileMoneyPayment = (tontineId: string, memberId: string, memberName: string) => {
    setMomoTarget({ tontineId, memberId, memberName });
    setIsMobileMoneyModalOpen(true);
  };

  const isWorkspaceView =
    isAuthenticated &&
    !['landing', 'login', 'register', 'forgot_password'].includes(currentView);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isAuthenticated={isAuthenticated}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenViralShare={() => handleOpenViralShare()}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex w-full">
        {/* Workspace Sidebar (visible in app mode) */}
        {isWorkspaceView && (
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            onUserChanged={(u) => setCurrentUser(u)}
            unreadNotificationsCount={unreadNotificationsCount}
            onLogout={handleLogout}
            onOpenViralShare={() => handleOpenViralShare()}
          />
        )}

        {/* Content Viewport */}
        <main
          className={`flex-1 ${
            isWorkspaceView ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8' : ''
          }`}
        >
          {/* Public Landing View */}
          {currentView === 'landing' && (
            <LandingView
              onNavigate={handleNavigate}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            />
          )}

          {/* Authentication Views */}
          {(currentView === 'login' ||
            currentView === 'register' ||
            currentView === 'forgot_password') && (
            <AuthView
              initialMode={currentView as 'login' | 'register' | 'forgot_password'}
              onSuccess={handleLoginSuccess}
              onNavigateLanding={() => setCurrentView('landing')}
            />
          )}

          {/* App Workspace Views */}
          {isWorkspaceView && (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                  onOpenRecordContributionModal={() => {
                    setRecordDefaults({});
                    setIsRecordContributionModalOpen(true);
                  }}
                  onOpenCreateTontineModal={() => {
                    setEditingTontine(null);
                    setIsCreateTontineModalOpen(true);
                  }}
                  onOpenAddMemberModal={() => {
                    setAddMemberTargetTontineId(undefined);
                    setIsAddMemberModalOpen(true);
                  }}
                  onOpenRecordExpenseModal={() => {
                    setIsRecordExpenseModalOpen(true);
                  }}
                  onViewReceipt={(r) => setActiveReceipt(r)}
                />
              )}

              {currentView === 'tontines' && (
                <TontinesView
                  currentUser={currentUser}
                  onNavigateDetail={(id) => handleNavigate('tontine_detail', { tontineId: id })}
                  onOpenCreateModal={() => {
                    setEditingTontine(null);
                    setIsCreateTontineModalOpen(true);
                  }}
                  onOpenEditModal={(t) => {
                    setEditingTontine(t);
                    setIsCreateTontineModalOpen(true);
                  }}
                />
              )}

              {currentView === 'tontine_detail' && (
                <TontineDetailView
                  tontineId={activeTontineId}
                  currentUser={currentUser}
                  onBack={() => handleNavigate('tontines')}
                  onOpenRecordContributionModal={(tId, mId) => {
                    setRecordDefaults({ tontineId: tId, memberId: mId });
                    setIsRecordContributionModalOpen(true);
                  }}
                  onOpenAddMemberModal={() => {
                    setAddMemberTargetTontineId(activeTontineId);
                    setIsAddMemberModalOpen(true);
                  }}
                  onViewReceipt={(r) => setActiveReceipt(r)}
                />
              )}

              {currentView === 'membres' && (
                <MembersView
                  currentUser={currentUser}
                  isAddModalOpen={isAddMemberModalOpen}
                  onCloseAddModal={() => setIsAddMemberModalOpen(false)}
                  onOpenRecordContributionModal={(tId, mId) => {
                    setRecordDefaults({ tontineId: tId, memberId: mId });
                    setIsRecordContributionModalOpen(true);
                  }}
                />
              )}

              {currentView === 'cotisations' && (
                <ContributionsView
                  currentUser={currentUser}
                  onOpenMobileMoneyPayment={handleOpenMobileMoneyPayment}
                  onViewReceipt={(r) => setActiveReceipt(r)}
                  isRecordModalOpen={isRecordContributionModalOpen}
                  onCloseRecordModal={() => setIsRecordContributionModalOpen(false)}
                />
              )}

              {currentView === 'beneficiaires' && (
                <BeneficiariesView currentUser={currentUser} />
              )}

              {currentView === 'depenses' && (
                <ExpensesView currentUser={currentUser} />
              )}

              {currentView === 'penalites' && (
                <PenaltiesView
                  currentUser={currentUser}
                  onOpenRecordContributionModal={(tId, mId) => {
                    setRecordDefaults({ tontineId: tId, memberId: mId });
                    setIsRecordContributionModalOpen(true);
                  }}
                />
              )}

              {currentView === 'rapports' && (
                <ReportsView
                  currentUser={currentUser}
                  onViewReceipt={(r) => setActiveReceipt(r)}
                />
              )}

              {currentView === 'notifications' && (
                <NotificationsView
                  currentUser={currentUser}
                  onNavigate={handleNavigate}
                  onRefreshNotifications={refreshNotificationCount}
                />
              )}

              {currentView === 'abonnement' && (
                <SubscriptionView currentUser={currentUser} onNavigate={handleNavigate} />
              )}

              {currentView === 'support' && (
                <SupportView currentUser={currentUser} />
              )}

              {currentView === 'profil' && (
                <ProfileSettingsView
                  currentUser={currentUser}
                  onUserUpdated={(u) => setCurrentUser(u)}
                />
              )}

              {currentView === 'mon_compte' && (
                <MonCompteView
                  currentUser={currentUser}
                  onUserUpdated={(u) => setCurrentUser(u)}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'admin' && (
                <SuperAdminView currentUser={currentUser} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals - Available from Anywhere */}
      <CreateTontineModal
        isOpen={isCreateTontineModalOpen}
        onClose={() => {
          setIsCreateTontineModalOpen(false);
          setEditingTontine(null);
        }}
        currentUser={currentUser}
        initialTontine={editingTontine}
        onSuccess={(tontine) => {
          refreshNotificationCount();
          setActiveTontineId(tontine.id);
        }}
        onNavigateDashboard={() => handleNavigate('dashboard')}
      />

      <RecordContributionModal
        isOpen={isRecordContributionModalOpen}
        onClose={() => setIsRecordContributionModalOpen(false)}
        currentUser={currentUser}
        defaultTontineId={recordDefaults.tontineId}
        defaultMemberId={recordDefaults.memberId}
        onSuccess={(_c, receipt) => {
          refreshNotificationCount();
          if (receipt) setActiveReceipt(receipt);
        }}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        currentUser={currentUser}
        targetTontineId={addMemberTargetTontineId}
        onSuccess={() => {
          refreshNotificationCount();
        }}
      />

      <RecordExpenseModal
        isOpen={isRecordExpenseModalOpen}
        onClose={() => setIsRecordExpenseModalOpen(false)}
        currentUser={currentUser}
        onSuccess={() => {
          refreshNotificationCount();
        }}
      />

      <ReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <MobileMoneyModal
        isOpen={isMobileMoneyModalOpen}
        onClose={() => setIsMobileMoneyModalOpen(false)}
        tontineId={momoTarget.tontineId || storage.getTontines()[0]?.id || ''}
        memberId={momoTarget.memberId}
        memberName={momoTarget.memberName}
        onPaymentSuccess={(receiptId) => {
          if (receiptId) {
            const found = storage.getReceipts().find((r) => r.id === receiptId);
            if (found) setActiveReceipt(found);
          }
          refreshNotificationCount();
        }}
      />

      <ViralShareModal
        isOpen={isViralShareOpen}
        onClose={() => setIsViralShareOpen(false)}
        currentUser={currentUser}
        initialTontineId={viralShareTontineId}
      />
    </div>
  );
}
