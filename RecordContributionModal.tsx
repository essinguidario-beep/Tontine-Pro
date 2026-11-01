/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Global Record Contribution Modal
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Receipt as ReceiptIcon,
  Smartphone,
  Wallet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { storage } from '../../services/storage';
import { formatFCFA, generateTransactionReference } from '../../services/mobileMoney';
import { Contribution, PaymentMethod, UserProfile, Receipt } from '../../types';

interface RecordContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  defaultTontineId?: string;
  defaultMemberId?: string;
  onSuccess: (contribution: Contribution, receipt?: Receipt) => void;
}

export const RecordContributionModal: React.FC<RecordContributionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  defaultTontineId,
  defaultMemberId,
  onSuccess,
}) => {
  const tontines = storage.getTontines();
  const allMembers = storage.getMembers();

  const [tontineId, setTontineId] = useState(defaultTontineId || tontines[0]?.id || '');
  const [memberId, setMemberId] = useState(defaultMemberId || '');
  const [amount, setAmount] = useState(50000);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [txRef, setTxRef] = useState(generateTransactionReference('COT'));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReceipt, setCreatedReceipt] = useState<Receipt | null>(null);

  // Available members for the selected tontine
  const availableMembers = allMembers.filter((m) => m.tontine_id === tontineId);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setCreatedReceipt(null);
      const activeTontineId = defaultTontineId || tontines[0]?.id || '';
      setTontineId(activeTontineId);

      const targetTontine = tontines.find((t) => t.id === activeTontineId);
      if (targetTontine) {
        setAmount(targetTontine.contribution_amount);
      }

      const tontineMembers = allMembers.filter((m) => m.tontine_id === activeTontineId);
      setMemberId(defaultMemberId || tontineMembers[0]?.id || '');
      setTxRef(generateTransactionReference('COT'));
      setPaymentDate(new Date().toISOString().slice(0, 10));
    }
  }, [isOpen, defaultTontineId, defaultMemberId]);

  const handleTontineChange = (newTontineId: string) => {
    setTontineId(newTontineId);
    const targetTontine = tontines.find((t) => t.id === newTontineId);
    if (targetTontine) {
      setAmount(targetTontine.contribution_amount);
    }
    const tontineMembers = allMembers.filter((m) => m.tontine_id === newTontineId);
    setMemberId(tontineMembers[0]?.id || '');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tontineId) {
      setError('Veuillez sélectionner une tontine.');
      return;
    }
    if (!memberId) {
      setError('Veuillez sélectionner le membre qui effectue le versement.');
      return;
    }
    if (!amount || amount <= 0) {
      setError('Le montant doit être supérieur à 0 FCFA.');
      return;
    }
    if (!paymentDate) {
      setError('Veuillez sélectionner la date du versement.');
      return;
    }
    if (!txRef.trim()) {
      setError('La référence de transaction est obligatoire.');
      return;
    }

    try {
      setIsSubmitting(true);

      const saved = storage.createContribution({
        tontine_id: tontineId,
        member_id: memberId,
        amount: Number(amount),
        cycle_number: 1,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        transaction_ref: txRef.trim().toUpperCase(),
        status: 'confirmed',
        notes: notes.trim() || `Cotisation enregistrée par ${currentUser.full_name}`,
      });

      const receipt = storage.getReceipts().find((r) => r.transaction_ref === saved.transaction_ref);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      setIsSubmitting(false);
      setCreatedReceipt(receipt || null);
      onSuccess(saved, receipt);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Erreur lors de l'enregistrement de la cotisation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-left">
        {createdReceipt ? (
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                Paiement Confirmé
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                Cotisation enregistrée avec succès !
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Le versement de <strong className="font-mono text-slate-900">{formatFCFA(amount)}</strong> a été crédité en caisse. Un reçu officiel a été généré.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-left space-y-1 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Réf. Transaction :</span>
                <span className="font-bold text-slate-900">{createdReceipt.transaction_ref}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>N° Reçu :</span>
                <span className="font-bold text-emerald-700">{createdReceipt.receipt_number}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Membre :</span>
                <span className="font-sans font-semibold text-slate-900">{createdReceipt.member_name}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Enregistrer une Cotisation</h3>
                  <p className="text-[10px] text-slate-400">Écriture comptable au grand livre</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tontine concernée *
                  </label>
                  <select
                    value={tontineId}
                    onChange={(e) => handleTontineChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {tontines.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Membre cotisant *
                  </label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {availableMembers.length === 0 ? (
                      <option value="">Aucun membre dans cette tontine</option>
                    ) : (
                      availableMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.member_name} ({m.phone})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Montant versé (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date du versement *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mode de règlement *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'mtn_momo', label: 'MTN MoMo (*126#)' },
                    { id: 'orange_money', label: 'Orange Money (*150#)' },
                    { id: 'cash', label: 'Espèces' },
                    { id: 'bank_transfer', label: 'Virement' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition text-center ${
                        paymentMethod === m.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Référence de transaction unique *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={txRef}
                    onChange={(e) => setTxRef(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setTxRef(generateTransactionReference('COT'))}
                    className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                  >
                    Régénérer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observation / Commentaire
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Cotisation cycle régulier"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-xs"
                >
                  {isSubmitting ? 'Validation...' : 'Valider la cotisation'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
