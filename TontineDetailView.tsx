/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Tontine Detail Deep-Dive View
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Coins,
  Calendar,
  TrendingDown,
  ShieldAlert,
  FileText,
  Plus,
  Share2,
  CheckCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { storage } from '../services/storage';
import { formatFCFA } from '../services/mobileMoney';
import { Tontine, UserProfile, Receipt } from '../types';

interface TontineDetailViewProps {
  tontineId: string;
  currentUser: UserProfile;
  onBack: () => void;
  onOpenRecordContributionModal: (tontineId: string, memberId?: string) => void;
  onOpenAddMemberModal: (tontineId: string) => void;
  onViewReceipt: (receipt: Receipt) => void;
}

export const TontineDetailView: React.FC<TontineDetailViewProps> = ({
  tontineId,
  currentUser,
  onBack,
  onOpenRecordContributionModal,
  onOpenAddMemberModal,
  onViewReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'beneficiaries' | 'contributions' | 'expenses' | 'rules'>('members');
  const [, setTick] = useState(0);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Reactive subscription
  React.useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  const tontine = storage.getTontineById(tontineId);

  if (!tontine) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p>Tontine introuvable ou archivée.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold">
          Retour à la liste des tontines
        </button>
      </div>
    );
  }

  const members = storage.getMembers(tontine.id);
  const contributions = storage.getContributions(tontine.id);
  const beneficiaries = storage.getBeneficiaries(tontine.id);
  const expenses = storage.getExpenses(tontine.id);
  const summary = storage.getFinancialSummary(tontine.id);
  const receipts = storage.getReceipts();

  const handleShareInvite = () => {
    const inviteLink = `${window.location.origin}/#invite=${tontine.id}`;
    const message = `Bonjour, vous êtes invité(e) à rejoindre la tontine "${tontine.name}" sur TontinePro.\nCotisation : ${formatFCFA(tontine.contribution_amount)} (${tontine.frequency})\nRejoignez le groupe ici : ${inviteLink}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(message);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 3000);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Breadcrumb & Return */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Toutes les Tontines</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {tontine.name}
            </h1>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              {tontine.status === 'active' ? 'Active' : tontine.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {tontine.meeting_day_info || 'Réunion périodique'} · Devise : FCFA (XAF)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShareInvite}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200"
            title="Inviter par WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{inviteCopied ? 'Lien d’invitation copié !' : 'Inviter par WhatsApp'}</span>
          </button>

          <button
            onClick={() => onOpenRecordContributionModal(tontine.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Enregistrer un versement</span>
          </button>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Cotisation / part</div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1">
            {formatFCFA(tontine.contribution_amount)}
          </div>
          <div className="text-[10px] text-slate-400 capitalize">{tontine.frequency}</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Cagnotte du Tour</div>
          <div className="text-lg font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {formatFCFA(tontine.contribution_amount * members.length)}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">Pour chaque bénéficiaire</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Solde de Caisse Actuel</div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1">
            {formatFCFA(summary.cashBalance)}
          </div>
          <div className="text-[10px] text-slate-400">Total collecté - sorties</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Membres Adhérents</div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1">
            {members.length} / {tontine.total_members_target}
          </div>
          <div className="text-[10px] text-slate-400">Parts actives enregistrées</div>
        </div>
      </div>

      {/* Segmented Controls Tabs (Zero-pill discipline) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        {[
          { id: 'members', label: `Membres (${members.length})`, icon: Users },
          { id: 'beneficiaries', label: `Bénéficiaires & Tours (${beneficiaries.length})`, icon: Calendar },
          { id: 'contributions', label: `Cotisations (${contributions.length})`, icon: Coins },
          { id: 'expenses', label: `Dépenses (${expenses.length})`, icon: TrendingDown },
          { id: 'rules', label: 'Règles & Règlements', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Membres */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Membres Adhérents de la Tontine
            </h3>
            <button
              onClick={() => onOpenAddMemberModal(tontine.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un membre</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Membre</th>
                  <th className="px-4 py-3">Téléphone (+237)</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3 text-right">Cotisé</th>
                  <th className="px-4 py-3 text-right">Dettes</th>
                  <th className="px-4 py-3 text-center">Cagnotte</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=TP'}
                          alt={m.member_name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <div className="font-semibold text-slate-900">{m.member_name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 tabular-nums">{m.phone}</td>
                    <td className="px-4 py-3 capitalize text-slate-700 font-medium">
                      {m.role === 'president' ? 'Président(e)' : m.role === 'treasurer' ? 'Trésorier(e)' : m.role === 'secretary' ? 'Secrétaire' : 'Membre'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatFCFA(m.total_contributed)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {m.total_debt > 0 ? (
                        <span className="text-red-600 font-bold">{formatFCFA(m.total_debt)}</span>
                      ) : (
                        <span className="text-slate-400">0 FCFA</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.is_beneficiary_paid ? (
                        <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Reçue
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> En attente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onOpenRecordContributionModal(tontine.id, m.id)}
                        className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px] transition"
                      >
                        Cotiser
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Bénéficiaires & Tours */}
      {activeTab === 'beneficiaries' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                Calendrier de Rotation des Bénéficiaires
              </h3>
              <p className="text-[11px] text-slate-500">
                Ordre de passage défini et verrouillé pour éviter toute contestation.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {beneficiaries.map((b) => (
              <div
                key={b.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                    b.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'current'
                      ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    #{b.cycle_number}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{b.member_name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Date prévue : {new Date(b.scheduled_date).toLocaleDateString('fr-FR')}</span>
                      {b.transaction_ref && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{b.transaction_ref}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                      {formatFCFA(b.pot_amount)}
                    </div>
                    <div className="text-[10px] text-slate-400">Montant de la cagnotte</div>
                  </div>

                  <div>
                    {b.status === 'paid' ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-[11px] rounded-lg border border-emerald-200">
                        ✓ Versée
                      </span>
                    ) : b.status === 'current' ? (
                      <button
                        onClick={() => {
                          storage.recordPayout(b.id, 'mtn_momo');
                          alert(`Paiement de la cagnotte validé pour ${b.member_name}`);
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition shadow-xs"
                      >
                        Enregistrer versement
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium">À venir</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Cotisations */}
      {activeTab === 'contributions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Historique des Versements de cette Tontine
            </h3>
            <button
              onClick={() => onOpenRecordContributionModal(tontine.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau versement</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Réf</th>
                  <th className="px-4 py-3">Membre</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-right">Reçu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contributions.map((c) => {
                  const receipt = receipts.find((r) => r.transaction_ref === c.transaction_ref);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-mono font-medium text-slate-600">{c.transaction_ref}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{c.member_name}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">
                        {new Date(c.payment_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-700">
                        {c.payment_method === 'mtn_momo' ? 'MTN MoMo' : c.payment_method === 'orange_money' ? 'Orange Money' : 'Espèces'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatFCFA(c.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {receipt ? (
                          <button
                            onClick={() => onViewReceipt(receipt)}
                            className="text-emerald-700 font-bold hover:underline text-[11px]"
                          >
                            Voir reçu
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Dépenses */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Dépenses & Frais de Fonctionnement</h3>
            <span className="text-xs font-mono font-bold text-red-600 tabular-nums">
              Total dépenses : {formatFCFA(summary.totalExpenses)}
            </span>
          </div>

          <div className="space-y-3">
            {expenses.map((e) => (
              <div key={e.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{e.description}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Réf : {e.reference} · Autorisé par : {e.authorized_by} · Date : {new Date(e.expense_date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="font-mono font-bold text-red-600 text-sm tabular-nums">
                  -{formatFCFA(e.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Règles & Règlements */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Règlement Intérieur de la Tontine</h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
            <div>
              <span className="font-bold text-slate-900 block mb-1">Règles fondamentales :</span>
              <p>{tontine.rules_summary}</p>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Régime des Pénalités de retard :</span>
              <p>
                Toute cotisation non honorée à la date d'échéance engendre une pénalité statutaire de{' '}
                <strong className="text-red-700 font-mono tabular-nums">{formatFCFA(tontine.penalty_rate)}</strong> par jour ouvré.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Responsables enregistrés :</span>
              <p>Bureau exécutif mandaté par les membres pour l'exercice 2026.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
