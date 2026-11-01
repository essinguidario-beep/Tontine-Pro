/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Main Dashboard View
 */

import React from 'react';
import {
  Coins,
  TrendingDown,
  AlertTriangle,
  Users,
  Building,
  Calendar,
  Plus,
  ArrowUpRight,
  Receipt as ReceiptIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  UserPlus,
  X,
  Zap,
} from 'lucide-react';
import { storage } from '../services/storage';
import { formatFCFA } from '../services/mobileMoney';
import { UserProfile, Receipt } from '../types';
import { ContributionsChart } from '../components/dashboard/ContributionsChart';
import { RecentPaymentsList } from '../components/dashboard/RecentPaymentsList';

interface DashboardViewProps {
  currentUser: UserProfile;
  onNavigate: (view: string, params?: { tontineId?: string }) => void;
  onOpenRecordContributionModal: () => void;
  onOpenCreateTontineModal: () => void;
  onOpenAddMemberModal: () => void;
  onOpenRecordExpenseModal?: () => void;
  onViewReceipt: (receipt: Receipt) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  onOpenRecordContributionModal,
  onOpenCreateTontineModal,
  onOpenAddMemberModal,
  onOpenRecordExpenseModal,
  onViewReceipt,
}) => {
  const [, setTick] = React.useState(0);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsQuickActionsOpen(false);
      }
    };
    if (isQuickActionsOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isQuickActionsOpen]);

  React.useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  const financialSummary = storage.getFinancialSummary();
  const tontines = storage.getTontines();
  const allMembers = storage.getMembers();
  const allContributions = storage.getContributions();
  const contributions = allContributions.slice(0, 5);
  const beneficiaries = storage.getBeneficiaries();
  const notifications = storage.getNotifications().slice(0, 4);
  const receipts = storage.getReceipts();

  // Find next upcoming beneficiary
  const nextBeneficiary = beneficiaries.find(
    (b) => b.status === 'current' || b.status === 'upcoming'
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Header / Breadcrumbs Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Espace de Gestion</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Tableau de bord</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Bonjour, {currentUser.full_name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi en temps réel de vos tontines et des flux de trésorerie en FCFA.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenRecordContributionModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Enregistrer Cotisation</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateTontineModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer une Tontine</span>
          </button>
        </div>
      </div>

      {/* Welcome action card for new users */}
      {tontines.length === 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white border border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Bienvenue sur votre espace TontinePro !</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Votre compte est configuré. Créez votre première tontine pour démarrer vos cycles de cotisation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenCreateTontineModal}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            Créer ma première tontine →
          </button>
        </div>
      )}

      {/* Next Beneficiary Spotlight Banner */}
      {nextBeneficiary && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white border border-emerald-800/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Prochain Bénéficiaire · Tour N°{nextBeneficiary.cycle_number}
                </span>
                <span className="text-[10px] text-slate-300">·</span>
                <span className="text-[11px] text-slate-300">
                  Échéance : {new Date(nextBeneficiary.scheduled_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {nextBeneficiary.member_name} doit recevoir sa cagnotte
              </h2>
              <p className="text-xs text-slate-300">
                Montant de la cagnotte estimée :{' '}
                <strong className="text-emerald-300 font-mono tabular-nums">
                  {formatFCFA(nextBeneficiary.pot_amount)}
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('beneficiaires')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-xs whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            Gérer le versement
          </button>
        </div>
      )}

      {/* Financial KPIs 6-Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Cotisations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium">Cotisations</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {formatFCFA(financialSummary.totalCollected)}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-medium flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmées en caisse</span>
          </div>
        </div>

        {/* Solde Disponible */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium">Solde Caisse</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-lg font-bold text-emerald-700 font-mono tabular-nums">
            {formatFCFA(financialSummary.cashBalance)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Disponible immédiatement
          </div>
        </div>

        {/* Cagnottes Versées */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium">Cagnottes Versées</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {formatFCFA(financialSummary.totalPayouts)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Aux bénéficiaires payés
          </div>
        </div>

        {/* Retards de Paiement */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium">Cotisations en Retard</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-lg font-bold text-red-600 font-mono tabular-nums">
            {formatFCFA(financialSummary.totalLateDebt)}
          </div>
          <div className="text-[10px] text-red-700 font-medium mt-1">
            {financialSummary.lateMembersCount} membre(s) en attente
          </div>
        </div>

        {/* Tontines Actives */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium">Tontines Actives</span>
            <Building className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {tontines.filter((t) => t.status === 'active').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Sur {tontines.length} enregistrées
          </div>
        </div>

        {/* Total Membres */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium">Total Membres</span>
            <Users className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
            {financialSummary.totalMembers}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Adhérents enregistrés
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Quick Actions & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Contribution Flow & Tontines */}
        <div className="lg:col-span-8 space-y-6">
          {/* Monthly Contributions Evolution Chart (Recharts) */}
          <ContributionsChart
            contributions={allContributions}
            beneficiaries={beneficiaries}
            tontines={tontines}
          />

          {/* Stylized Recent Payments List with Colored Confirmed Status Pastille */}
          <RecentPaymentsList
            contributions={allContributions}
            members={allMembers}
            tontines={tontines}
            receipts={receipts}
            onViewReceipt={onViewReceipt}
            onNavigateAll={() => onNavigate('cotisations')}
          />

          {/* Active Tontines Showcase */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Mes Tontines en Cours
              </h3>
              <button
                onClick={() => onNavigate('tontines')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Gérer toutes les tontines ({tontines.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {tontines.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Aucune tontine enregistrée</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Créez votre première tontine pour lancer votre cycle de cotisations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenCreateTontineModal}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer une tontine</span>
                  </button>
                </div>
              ) : (
                tontines.map((t) => {
                  const members = storage.getMembers(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => onNavigate('tontine_detail', { tontineId: t.id })}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                            {t.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {t.status === 'active' ? 'Active' : t.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {t.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                          <span>{members.length} membres</span>
                          <span>·</span>
                          <span>{t.meeting_day_info || 'Réunion mensuelle'}</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <div className="text-[10px] text-slate-400">Cotisation / part</div>
                        <div className="font-mono font-bold text-emerald-800 text-sm tabular-nums">
                          {formatFCFA(t.contribution_amount)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Transactions & Notifications */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Shortcuts Widget */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Raccourcis Fréquents
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenRecordContributionModal}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-800 transition text-left flex flex-col gap-1 border border-slate-700/60"
              >
                <Coins className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">Cotiser</span>
              </button>

              <button
                onClick={onOpenAddMemberModal}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-800 transition text-left flex flex-col gap-1 border border-slate-700/60"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">+ Membre</span>
              </button>

              <button
                onClick={() => onNavigate('beneficiaires')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-800 transition text-left flex flex-col gap-1 border border-slate-700/60"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">Ordre Tours</span>
              </button>

              <button
                onClick={() => onNavigate('rapports')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-800 transition text-left flex flex-col gap-1 border border-slate-700/60"
              >
                <ReceiptIcon className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">Rapports</span>
              </button>
            </div>
          </div>

          {/* Recent Contributions Feed */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Dernières Transactions
              </h3>
              <button
                onClick={() => onNavigate('cotisations')}
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                Voir tout
              </button>
            </div>

            <div className="space-y-3">
              {contributions.map((c) => {
                const receipt = receipts.find((r) => r.transaction_ref === c.transaction_ref);
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Coins className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 text-xs truncate">
                          {c.member_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {c.transaction_ref} · {c.payment_method === 'mtn_momo' ? 'MoMo' : c.payment_method === 'orange_money' ? 'OM' : 'Espèces'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                        +{formatFCFA(c.amount)}
                      </div>
                      {receipt && (
                        <button
                          onClick={() => onViewReceipt(receipt)}
                          className="text-[10px] text-emerald-700 hover:underline font-semibold"
                        >
                          Reçu
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Notifications Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Notifications Récentes
              </h3>
              <button
                onClick={() => onNavigate('notifications')}
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                Centre d'alertes
              </button>
            </div>

            <div className="space-y-2.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onNavigate(n.link_route || 'notifications')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 cursor-pointer transition border border-slate-100"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                    <span>{n.title}</span>
                    <span className="text-[9px] text-slate-400 font-normal">
                      {new Date(n.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating 'Quick Actions' Speed-Dial Button */}
      <div className="fixed bottom-20 lg:bottom-8 right-5 sm:right-8 z-40">
        {/* Backdrop overlay when open to easily dismiss by tapping anywhere */}
        {isQuickActionsOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-[1px] transition-opacity"
            onClick={() => setIsQuickActionsOpen(false)}
          />
        )}

        <div className="relative z-40 flex flex-col items-end">
          {/* Popover Action Menu */}
          {isQuickActionsOpen && (
            <div
              role="menu"
              aria-orientation="vertical"
              className="mb-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 origin-bottom-right"
            >
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Actions Rapides
                  </span>
                  <p className="text-[10px] text-slate-400">Exécution en 1 clic</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickActionsOpen(false)}
                  className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
                  aria-label="Fermer le menu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action 1: Record Contribution */}
              <button
                type="button"
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenRecordContributionModal();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200/60 transition group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                    Enregistrer une cotisation
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Saisir un versement de membre
                  </div>
                </div>
              </button>

              {/* Action 2: Add Member */}
              <button
                type="button"
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenAddMemberModal();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-blue-50/70 border border-transparent hover:border-blue-200/60 transition group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                    Ajouter un membre
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Inscrire un adhérent au groupe
                  </div>
                </div>
              </button>

              {/* Action 3: Register Expense */}
              <button
                type="button"
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  if (onOpenRecordExpenseModal) {
                    onOpenRecordExpenseModal();
                  } else {
                    onNavigate('depenses');
                  }
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-rose-50/70 border border-transparent hover:border-rose-200/60 transition group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-rose-900">
                    Déclarer une dépense
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Sortie de caisse ou frais de séance
                  </div>
                </div>
              </button>

              {/* Action 4: Create Tontine */}
              <button
                type="button"
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenCreateTontineModal();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-violet-50/70 border border-transparent hover:border-violet-200/60 transition group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition">
                  <Building className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 group-hover:text-violet-900">
                    Créer une tontine
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Lancer un nouveau cercle financier
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Main Floating Trigger Button */}
          <button
            type="button"
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            aria-expanded={isQuickActionsOpen}
            aria-label="Actions Rapides"
            className={`group flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full sm:rounded-2xl shadow-xl transition-all duration-200 cursor-pointer active:scale-95 border ${
              isQuickActionsOpen
                ? 'bg-slate-900 text-white border-slate-700 shadow-slate-900/30 ring-2 ring-emerald-500/50'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-emerald-400/30 shadow-emerald-900/30 hover:shadow-2xl'
            }`}
          >
            <div
              className={`w-5 h-5 flex items-center justify-center transition-transform duration-200 ${
                isQuickActionsOpen ? 'rotate-45' : 'group-hover:rotate-90'
              }`}
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm tracking-tight select-none">
              Actions Rapides
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-mono font-bold leading-none">
              +
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
