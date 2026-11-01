/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro Lite - Super Admin Platform Governance Console
 * Section 11: Real manual validation of Mobile Money subscription payments,
 * User management, quotas, and platform revenue metrics
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Building,
  Coins,
  TrendingUp,
  Headphones,
  Settings,
  Lock,
  CheckCircle,
  Clock,
  Search,
  Check,
  X,
  Smartphone,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { storage } from '../services/storage';
import { formatFCFA } from '../services/mobileMoney';
import { UserProfile, SupportTicket, SubscriptionPaymentRequest } from '../types';

interface SuperAdminViewProps {
  currentUser: UserProfile;
  onNavigate?: (view: string) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({ currentUser, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'sub_requests' | 'overview' | 'users' | 'tontines' | 'support'>('sub_requests');
  const [profiles, setProfiles] = useState(storage.getProfiles());
  const [tontines, setTontines] = useState(storage.getTontines());
  const [tickets, setTickets] = useState(storage.getSupportTickets());
  const [subRequests, setSubRequests] = useState<SubscriptionPaymentRequest[]>(storage.getSubscriptionRequests());
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reactive subscription
  useEffect(() => {
    const refresh = () => {
      setProfiles(storage.getProfiles());
      setTontines(storage.getTontines());
      setTickets(storage.getSupportTickets());
      setSubRequests(storage.getSubscriptionRequests());
    };
    refresh();
    const unsubscribe = storage.subscribe(refresh);
    return unsubscribe;
  }, []);

  // Super Admin security check (Section 11)
  if (currentUser.role !== 'super_admin') {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
        <Lock className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-900 text-sm">Accès Réservé Super Admin</h3>
        <p className="mt-1">Cette console est strictement restreinte aux administrateurs de la plateforme TontinePro Lite.</p>
        <p className="mt-2 text-slate-400">
          Pour tester cette console, utilisez le sélecteur de compte dans le panneau latéral pour basculer sur <strong>Dario Essingui (Super Admin)</strong>.
        </p>
      </div>
    );
  }

  const pendingRequests = subRequests.filter((r) => r.status === 'pending');
  const totalUsers = profiles.length;
  const totalTontines = tontines.length;
  const paidSubs = profiles.filter((p) => p.subscription_tier === 'standard' || p.subscription_tier === 'premium');
  const estimatedMRR = paidSubs.reduce(
    (acc, p) => acc + (p.subscription_tier === 'premium' ? 5000 : 2000),
    0
  );

  const handleApproveRequest = (reqId: string) => {
    const success = storage.approveSubscriptionPayment(reqId, currentUser.full_name);
    if (success) {
      setFeedbackMsg({
        type: 'success',
        text: 'Abonnement validé avec succès ! Le compte client a été crédité de 30 jours et son profil mis à jour.',
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleRejectRequest = (reqId: string) => {
    const success = storage.rejectSubscriptionPayment(
      reqId,
      currentUser.full_name,
      'Transfert Mobile Money non constaté sur le compte récepteur. Vérifier le SMS.'
    );
    if (success) {
      setFeedbackMsg({
        type: 'error',
        text: 'Demande rejetée. Le client a été notifié par message in-app.',
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleTierChange = (userId: string, newTier: 'free' | 'standard' | 'premium') => {
    storage.updateProfileTier(userId, newTier);
    setProfiles(storage.getProfiles());
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Administration Centrale</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Console Super Admin TontinePro Lite</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Console Administrateur</span>
            <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full uppercase">
              Root Access
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Validation manuelle des paiements Mobile Money, supervision des utilisateurs et gouvernance SaaS.
          </p>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition self-start"
          >
            ← Retour Espace Gestion
          </button>
        )}
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        {[
          {
            id: 'sub_requests',
            label: `Paiements MoMo en attente (${pendingRequests.length})`,
            badge: pendingRequests.length,
          },
          { id: 'overview', label: 'Indicateurs SaaS' },
          { id: 'users', label: `Comptes Utilisateurs (${profiles.length})` },
          { id: 'tontines', label: `Tontines Gérées (${tontines.length})` },
          { id: 'support', label: `Support & Tickets (${tickets.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: Subscription Requests Validation (Section 10 & 11) */}
      {activeTab === 'sub_requests' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Vérification Manuelle des Paiements Mobile Money (Section 10)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vérifiez sur votre téléphone que les fonds ont bien été reçus sur le compte MTN MoMo (+237 677 00 11 22) ou Orange Money (+237 699 33 44 55), puis validez en 1 clic.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {pendingRequests.length} à traiter
              </span>
            </div>

            {subRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aucune demande de paiement d’abonnement pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Client (Responsable)</th>
                      <th className="px-4 py-3">Téléphone (+237)</th>
                      <th className="px-4 py-3">Offre Demandée</th>
                      <th className="px-4 py-3">Opérateur</th>
                      <th className="px-4 py-3 font-mono">Réf Reçue SMS</th>
                      <th className="px-4 py-3 text-right">Montant</th>
                      <th className="px-4 py-3 text-center">Statut</th>
                      <th className="px-4 py-3 text-right">Action Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {new Date(req.submitted_at).toLocaleDateString('fr-FR')} {new Date(req.submitted_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {req.user_name}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">
                          {req.user_phone}
                        </td>
                        <td className="px-4 py-3 font-extrabold uppercase text-emerald-800">
                          {req.plan}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {req.payment_method === 'mtn_momo' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                              MTN MoMo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-orange-700">
                              Orange Money
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-950">
                          {req.transaction_ref}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-extrabold text-slate-900">
                          {formatFCFA(req.amount_fcfa)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {req.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" /> En attente
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" /> Validé
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <X className="w-3 h-3" /> Rejeté
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleApproveRequest(req.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition flex items-center gap-1"
                                title="Valider et activer +30 jours"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Valider & Activer</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectRequest(req.id)}
                                className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[11px] rounded-lg transition"
                                title="Rejeter la demande"
                              >
                                Rejeter
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Traité par {req.reviewed_by?.split(' ')[0] || 'Admin'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Revenu Récurrent Mensuel (MRR)</span>
              <div className="text-xl font-bold font-mono text-emerald-800 tabular-nums mt-1">
                {formatFCFA(estimatedMRR)}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {paidSubs.length} abonné(s) payants
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Utilisateurs Enregistrés</span>
              <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-1">
                {totalUsers}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Cameroun (Douala, Yaoundé...)</div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Tontines Actives</span>
              <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-1">
                {totalTontines}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">En cours d'exploitation</div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Demandes MoMo en cours</span>
              <div className="text-xl font-bold font-mono text-amber-700 tabular-nums mt-1">
                {pendingRequests.length}
              </div>
              <div className="text-[10px] text-amber-600 font-semibold mt-0.5">À approuver</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Users Accounts & Tier Modifiers */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Répertoire des Comptes Utilisateurs (Responsables de Tontine)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Nom & Prénom</th>
                  <th className="px-4 py-2.5">Téléphone (+237)</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Ville</th>
                  <th className="px-4 py-2.5">Rôle</th>
                  <th className="px-4 py-2.5">Formule SaaS Active</th>
                  <th className="px-4 py-2.5 text-right">Modifier Formule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{p.full_name}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{p.phone}</td>
                    <td className="px-4 py-2.5 text-slate-500">{p.email}</td>
                    <td className="px-4 py-2.5 text-slate-600">{p.city}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.role === 'super_admin' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 uppercase font-bold text-emerald-800">
                      {p.subscription_tier}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {p.role !== 'super_admin' ? (
                        <select
                          value={p.subscription_tier || 'free'}
                          onChange={(e) =>
                            handleTierChange(p.id, e.target.value as 'free' | 'standard' | 'premium')
                          }
                          className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer focus:outline-emerald-600"
                        >
                          <option value="free">Gratuit</option>
                          <option value="standard">Standard (1 000 FCFA)</option>
                          <option value="premium">Premium (2 000 FCFA)</option>
                        </select>
                      ) : (
                        <span className="text-[10px] text-slate-400">Illimité</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Tontines */}
      {activeTab === 'tontines' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Toutes les Tontines de la Plateforme TontinePro Lite
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Nom de la Tontine</th>
                  <th className="px-4 py-2.5">Fréquence</th>
                  <th className="px-4 py-2.5 text-right">Cotisation / part</th>
                  <th className="px-4 py-2.5 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tontines.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{t.name}</td>
                    <td className="px-4 py-2.5 capitalize text-slate-600">{t.frequency}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-800">
                      {formatFCFA(t.contribution_amount)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Support */}
      {activeTab === 'support' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Tickets d'Assistance Technique & Mobile Money
          </h3>
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{t.subject}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{t.messages[0]?.text}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Par {t.user_name} ({t.user_phone})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
