/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Penalties, Late Dues & Debt Recovery View
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  Coins,
  Send,
  Building,
  Filter,
} from 'lucide-react';
import { storage } from '../services/storage';
import { formatFCFA } from '../services/mobileMoney';
import { PenaltyRecord, UserProfile } from '../types';

interface PenaltiesViewProps {
  currentUser: UserProfile;
  onOpenRecordContributionModal: (tontineId: string, memberId: string) => void;
}

export const PenaltiesView: React.FC<PenaltiesViewProps> = ({
  currentUser,
  onOpenRecordContributionModal,
}) => {
  const [tontines, setTontines] = useState(storage.getTontines());
  const [selectedTontineId, setSelectedTontineId] = useState<string>(storage.getTontines()[0]?.id || '');
  const [penalties, setPenalties] = useState<PenaltyRecord[]>(storage.getPenalties());
  const [reminderCopied, setReminderCopied] = useState<string | null>(null);

  // Reactive subscription
  React.useEffect(() => {
    const listTontines = storage.getTontines();
    setTontines(listTontines);
    setPenalties(storage.getPenalties());

    const unsubscribe = storage.subscribe(() => {
      const updatedTontines = storage.getTontines();
      setTontines(updatedTontines);
      setPenalties(storage.getPenalties());
      setSelectedTontineId((prev) => {
        if (!prev && updatedTontines.length > 0) return updatedTontines[0].id;
        return prev;
      });
    });
    return unsubscribe;
  }, []);

  const currentTontine = tontines.find((t) => t.id === selectedTontineId) || tontines[0];
  const members = storage.getMembers(currentTontine?.id);
  const lateMembers = members.filter((m) => m.status === 'late' || m.total_debt > 0);

  const refreshList = () => {
    setPenalties(storage.getPenalties());
  };

  const handleResolvePenalty = (penaltyId: string, action: 'paid' | 'waived') => {
    storage.resolvePenalty(penaltyId, action);
    refreshList();
  };

  const handleSendReminder = (m: (typeof members)[0]) => {
    const text = `Rappel Tontine "${currentTontine?.name || 'Tontine'}" :\nBonjour ${m.member_name}, votre cotisation présente un solde en attente de régularisation (${formatFCFA(m.total_debt)}). Merci d'effectuer votre versement via MTN MoMo (*126#) ou Orange Money (*150#).`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setReminderCopied(m.id);
      setTimeout(() => setReminderCopied(null), 3000);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Espace de Gestion</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Dettes & Retards</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Suivi des Retards & Pénalités
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Détection des cotisations échues et application équitable des sanctions validées.
          </p>
        </div>

        <select
          value={selectedTontineId}
          onChange={(e) => setSelectedTontineId(e.target.value)}
          className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
        >
          {tontines.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Overdue Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Membres avec Dettes Échues</div>
          <div className="text-lg font-bold text-red-600 font-mono tabular-nums mt-1">
            {lateMembers.length} adhérent(s)
          </div>
          <div className="text-[10px] text-slate-400">À régulariser avant le prochain tour</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Cumul des Cotisations en Retard</div>
          <div className="text-lg font-bold text-red-600 font-mono tabular-nums mt-1">
            {formatFCFA(lateMembers.reduce((acc, m) => acc + m.total_debt, 0))}
          </div>
          <div className="text-[10px] text-slate-400">Fonds manquants en caisse</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Règle de Pénalité Statutaire</div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1">
            {formatFCFA(currentTontine?.penalty_rate || 2000)} / jour
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">Validée au règlement intérieur</div>
        </div>
      </div>

      {/* Late Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Adhérents Présentant un Arriéré de Cotisation
          </h3>
          <span className="text-[11px] text-slate-500">
            {lateMembers.length} membre(s) concerné(s)
          </span>
        </div>

        {lateMembers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">Aucun retard détecté !</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tous les membres de cette tontine sont à jour de leurs cotisations.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lateMembers.map((m) => (
              <div
                key={m.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                    !
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{m.member_name}</h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{m.phone}</span>
                      <span>·</span>
                      <span>Déjà cotisé : {formatFCFA(m.total_contributed)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="font-mono font-bold text-red-600 text-sm tabular-nums">
                      {formatFCFA(m.total_debt)}
                    </div>
                    <div className="text-[10px] text-slate-400">Montant en retard</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendReminder(m)}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition border border-emerald-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3 text-emerald-700" />
                      <span>{reminderCopied === m.id ? 'Message copié !' : 'Copier rappel WhatsApp'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenRecordContributionModal(m.tontine_id, m.id)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer"
                    >
                      Régulariser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Penalties Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Historique des Sanctions & Pénalités Notifiées
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Membre sanctionné</th>
                <th className="px-4 py-3">Motif du retard</th>
                <th className="px-4 py-3">Date limite</th>
                <th className="px-4 py-3 text-right">Montant pénalité</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {penalties.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">{p.member_name}</td>
                  <td className="px-4 py-3 text-slate-700">{p.reason}</td>
                  <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">
                    {new Date(p.due_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-red-600 tabular-nums">
                    {formatFCFA(p.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'waived'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {p.status === 'paid' ? 'Payée' : p.status === 'waived' ? 'Exonérée' : 'Impayée'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status === 'unpaid' && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResolvePenalty(p.id, 'paid')}
                          className="text-emerald-700 font-bold hover:underline text-[11px]"
                        >
                          Marquer payée
                        </button>
                        <span>·</span>
                        <button
                          onClick={() => handleResolvePenalty(p.id, 'waived')}
                          className="text-slate-500 hover:text-slate-800 text-[11px]"
                        >
                          Exonérer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
