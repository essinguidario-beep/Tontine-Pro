/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Beneficiaries Rotation & Payout Distribution View
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CalendarDays,
  CheckCircle,
  Clock,
  ArrowUpDown,
  Coins,
  ShieldCheck,
  Building,
  Sparkles,
  X,
  Smartphone,
} from 'lucide-react';
import { storage } from '../services/storage';
import { formatFCFA } from '../services/mobileMoney';
import { BeneficiaryRound, PaymentMethod, UserProfile } from '../types';

interface BeneficiariesViewProps {
  currentUser: UserProfile;
}

export const BeneficiariesView: React.FC<BeneficiariesViewProps> = ({ currentUser }) => {
  const [tontines, setTontines] = useState(storage.getTontines());
  const [selectedTontineId, setSelectedTontineId] = useState<string>(storage.getTontines()[0]?.id || '');
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRound[]>(storage.getBeneficiaries());
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  // Reactive subscription
  React.useEffect(() => {
    const listTontines = storage.getTontines();
    setTontines(listTontines);
    setBeneficiaries(storage.getBeneficiaries());

    const unsubscribe = storage.subscribe(() => {
      const updatedTontines = storage.getTontines();
      setTontines(updatedTontines);
      setBeneficiaries(storage.getBeneficiaries());
      setSelectedTontineId((prev) => {
        if (!prev && updatedTontines.length > 0) return updatedTontines[0].id;
        return prev;
      });
    });
    return unsubscribe;
  }, []);

  // Payout Modal
  const [selectedForPayout, setSelectedForPayout] = useState<BeneficiaryRound | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethod>('mtn_momo');
  const [payoutNotes, setPayoutNotes] = useState('Versement cagnotte de tontine');

  const refreshList = () => {
    setBeneficiaries(storage.getBeneficiaries());
  };

  const currentTontine = tontines.find((t) => t.id === selectedTontineId) || tontines[0];
  const list = beneficiaries.filter((b) => b.tontine_id === (currentTontine?.id || ''));

  const handleExecutePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForPayout) return;

    const res = storage.recordPayout(selectedForPayout.id, payoutMethod, payoutNotes);
    if (res.success) {
      // Trigger confetti celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // Fallback
      }

      refreshList();
      setSelectedForPayout(null);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newList = [...list];
    const temp = newList[index - 1];
    newList[index - 1] = newList[index];
    newList[index] = temp;
    storage.reorderBeneficiaries(currentTontine.id, newList);
    refreshList();
  };

  const handleMoveDown = (index: number) => {
    if (index >= list.length - 1) return;
    const newList = [...list];
    const temp = newList[index + 1];
    newList[index + 1] = newList[index];
    newList[index] = temp;
    storage.reorderBeneficiaries(currentTontine.id, newList);
    refreshList();
  };

  const totalDistributed = list
    .filter((b) => b.status === 'paid')
    .reduce((acc, b) => acc + b.pot_amount, 0);

  const totalPending = list
    .filter((b) => b.status !== 'paid')
    .reduce((acc, b) => acc + b.pot_amount, 0);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Espace de Gestion</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Bénéficiaires & Tours</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Rotation des Cagnottes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calendrier chronologique des tours, versements certifiés et réordonnancement autorisé.
          </p>
        </div>

        {/* Tontine Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedTontineId}
            onChange={(e) => setSelectedTontineId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white shadow-2xs"
          >
            {tontines.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Cagnottes Déjà Distribuées</div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1">
            {formatFCFA(totalDistributed)}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
            {list.filter((b) => b.status === 'paid').length} bénéficiaire(s) servi(s)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Cagnottes Restantes à Servir</div>
          <div className="text-lg font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {formatFCFA(totalPending)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {list.filter((b) => b.status !== 'paid').length} tour(s) programmé(s)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Montant Fixe de la Cagnotte</div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1">
            {formatFCFA(list[0]?.pot_amount || 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Par bénéficiaire désigné</div>
        </div>
      </div>

      {/* View Switcher Controls */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-sm">
          Calendrier des Tours ({list.length} tours au total)
        </h3>
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Vue Liste / Ordre
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Vue Calendrier
          </button>
        </div>
      </div>

      {/* Timeline List Mode */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
          {list.map((b, idx) => (
            <div
              key={b.id}
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                b.status === 'current'
                  ? 'bg-amber-50/40 border-l-4 border-l-amber-500'
                  : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Cycle Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                    b.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'current'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  #{b.cycle_number}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">{b.member_name}</h4>
                    {b.status === 'paid' && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Cagnotte Versée
                      </span>
                    )}
                    {b.status === 'current' && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded animate-pulse">
                        Tour Actuel
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>Date prévue : {new Date(b.scheduled_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    {b.payout_date && (
                      <>
                        <span>·</span>
                        <span>Payé le {new Date(b.payout_date).toLocaleDateString('fr-FR')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount and Action */}
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-left md:text-right">
                  <div className="font-mono font-extrabold text-slate-900 text-sm tabular-nums">
                    {formatFCFA(b.pot_amount)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {b.transaction_ref || 'Prêt pour décaissement'}
                  </div>
                </div>

                {/* Reorder Buttons (only for pending) */}
                {b.status !== 'paid' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                      title="Monter le tour"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === list.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                      title="Descendre le tour"
                    >
                      ▼
                    </button>
                  </div>
                )}

                {/* Action button */}
                <div>
                  {b.status === 'paid' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Validé</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedForPayout(b)}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs whitespace-nowrap"
                    >
                      Verser la cagnotte
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid Mode */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition text-left flex flex-col justify-between ${
                b.status === 'paid'
                  ? 'bg-white border-slate-200'
                  : b.status === 'current'
                  ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-slate-400">Tour #{b.cycle_number}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    b.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'current'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {b.status === 'paid' ? 'Versé' : b.status === 'current' ? 'En cours' : 'À venir'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{b.member_name}</h4>
                <div className="text-[11px] text-slate-500 mt-1">
                  Échéance : {new Date(b.scheduled_date).toLocaleDateString('fr-FR')}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="font-mono font-extrabold text-slate-900 text-xs tabular-nums">
                  {formatFCFA(b.pot_amount)}
                </span>
                {b.status !== 'paid' && (
                  <button
                    onClick={() => setSelectedForPayout(b)}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Décaisser
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Payout Execution */}
      {selectedForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Versement de la Cagnotte Tontine</h3>
              <button
                onClick={() => setSelectedForPayout(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecutePayout} className="p-6 space-y-4 text-left">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
                <div className="text-xs text-slate-600">Bénéficiaire désigné :</div>
                <div className="text-base font-extrabold text-slate-900">{selectedForPayout.member_name}</div>
                <div className="flex justify-between items-center pt-2 border-t border-emerald-200/60">
                  <span className="text-xs text-emerald-900 font-medium">Montant à reverser :</span>
                  <span className="text-lg font-mono font-extrabold text-emerald-950 tabular-nums">
                    {formatFCFA(selectedForPayout.pot_amount)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Moyen de versement au bénéficiaire
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="mtn_momo">MTN Mobile Money Cameroun (*126#)</option>
                  <option value="orange_money">Orange Money Cameroun (*150#)</option>
                  <option value="cash">Remise en espèces (Réunion solennelle)</option>
                  <option value="bank_transfer">Virement Bancaire (Afriland / UBA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observation ou Décharge
                </label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="Ex: Reçu en main propre lors de la réunion"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedForPayout(null)}
                  className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Valider le versement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
