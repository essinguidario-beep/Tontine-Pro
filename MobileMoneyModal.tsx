/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Mobile Money Cameroon Interactive Payment Modal
 * Supports MTN MoMo & Orange Money Cameroon with USSD prompt simulation
 */

import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { validateCameroonPhone, formatFCFA, initiateMobileMoneyPayment } from '../../services/mobileMoney';
import { storage } from '../../services/storage';

interface MobileMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tontineId: string;
  memberId: string;
  memberName: string;
  defaultAmount?: number;
  onPaymentSuccess: (receiptId?: string) => void;
}

export const MobileMoneyModal: React.FC<MobileMoneyModalProps> = ({
  isOpen,
  onClose,
  tontineId,
  memberId,
  memberName,
  defaultAmount = 50000,
  onPaymentSuccess,
}) => {
  const [provider, setProvider] = useState<'mtn_momo' | 'orange_money'>('mtn_momo');
  const [phone, setPhone] = useState('+237 699 44 21 00');
  const [amount, setAmount] = useState(defaultAmount);
  const [notes, setNotes] = useState('Cotisation via Mobile Money');
  const [step, setStep] = useState<'form' | 'ussd_prompt' | 'verifying' | 'success' | 'error'>('form');
  const [ussdPin, setUssdPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [txRef, setTxRef] = useState('');
  const [createdReceiptId, setCreatedReceiptId] = useState<string | undefined>();

  if (!isOpen) return null;

  const phoneValidation = validateCameroonPhone(phone);

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValidation.isValid) {
      setErrorMessage('Numéro camerounais invalide (+237 6XX XX XX XX)');
      return;
    }
    if (amount <= 0) {
      setErrorMessage('Le montant doit être supérieur à 0 FCFA');
      return;
    }

    setErrorMessage('');
    setStep('ussd_prompt');
  };

  const handleConfirmUssd = async () => {
    if (ussdPin.length < 4) {
      setErrorMessage('Veuillez entrer votre code PIN à 4 ou 5 chiffres');
      return;
    }

    setStep('verifying');
    try {
      const res = await initiateMobileMoneyPayment({
        amount,
        phone,
        provider,
        description: `Cotisation Tontine ${memberName}`,
      });

      if (res.success) {
        setTxRef(res.transactionRef);
        // Persist to storage
        const recordRes = storage.recordContribution({
          tontine_id: tontineId,
          member_id: memberId,
          amount,
          payment_method: provider,
          transaction_ref: res.transactionRef,
          notes,
        });

        if (recordRes.success) {
          setCreatedReceiptId(recordRes.receipt?.id);
          setStep('success');
        } else {
          setErrorMessage(recordRes.error || 'Erreur lors de l’enregistrement de la cotisation.');
          setStep('error');
        }
      } else {
        setErrorMessage(res.message);
        setStep('error');
      }
    } catch {
      setErrorMessage('La communication avec la passerelle télécom a échoué.');
      setStep('error');
    }
  };

  const handleFinish = () => {
    onPaymentSuccess(createdReceiptId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${provider === 'mtn_momo' ? 'bg-amber-400' : 'bg-orange-500'}`} />
            <h3 className="font-bold text-slate-900 text-sm">
              Paiement Mobile Money Cameroun
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleStartPayment} className="space-y-4">
              {/* Operator Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Choisissez l'opérateur Mobile Money
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProvider('mtn_momo')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-left ${
                      provider === 'mtn_momo'
                        ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center font-black text-slate-900 text-xs">
                      MoMo
                    </div>
                    <span className="text-xs font-bold text-slate-900">MTN MoMo (*126#)</span>
                    <span className="text-[10px] text-slate-500">Cameroun & Diaspora</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvider('orange_money')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-left ${
                      provider === 'orange_money'
                        ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-black text-white text-xs">
                      OM
                    </div>
                    <span className="text-xs font-bold text-slate-900">Orange Money (*150#)</span>
                    <span className="text-[10px] text-slate-500">Cameroun & CEMAC</span>
                  </button>
                </div>
              </div>

              {/* Member & Amount */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cotisant :</span>
                  <span className="font-semibold text-slate-800">{memberName}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Montant :</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm tabular-nums">
                    {formatFCFA(amount)}
                  </span>
                </div>
              </div>

              {/* Amount edit if needed */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Montant personnalisé (FCFA)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tabular-nums"
                  min="500"
                  step="500"
                />
              </div>

              {/* Phone number */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Numéro de téléphone payeur
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+237 6XX XX XX XX"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tabular-nums"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Ex: +237 670 12 34 56 (MTN) ou +237 699 00 11 22 (Orange)
                </span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Observation / Motif (optionnel)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Cotisation cycle 3"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                <span>Initier la demande USSD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'ussd_prompt' && (
            <div className="space-y-4 text-center">
              {/* Cameroon USSD screen simulator */}
              <div className="mx-auto w-64 p-4 rounded-2xl bg-slate-900 text-white shadow-xl border-4 border-slate-800 text-left relative overflow-hidden">
                <div className="text-[10px] text-slate-400 flex justify-between mb-3 border-b border-slate-800 pb-1">
                  <span>{provider === 'mtn_momo' ? 'MTN MoMo Cameroon' : 'Orange Money CM'}</span>
                  <span>USSD Push</span>
                </div>

                <p className="text-xs text-slate-200 mb-3 leading-relaxed">
                  Autoriser le paiement de <strong className="text-emerald-400">{formatFCFA(amount)}</strong> vers <strong>TONTINEPRO</strong> ?
                </p>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 block">
                    Entrez votre code secret PIN :
                  </label>
                  <input
                    type="password"
                    maxLength={5}
                    value={ussdPin}
                    onChange={(e) => setUssdPin(e.target.value)}
                    placeholder="••••"
                    autoFocus
                    className="w-full text-center py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-lg tracking-widest focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div className="text-[9px] text-slate-500 mt-2 text-center">
                  Simulation sécurisée sandbox TontinePro
                </div>
              </div>

              {errorMessage && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUssd}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Valider le prélèvement
                </button>
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div className="py-10 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Vérification de la transaction...</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Communication avec le switch télécom ({provider === 'mtn_momo' ? 'MTN MoMo Cameroon' : 'Orange Money CM'})...
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Paiement validé avec succès !</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Le montant de <strong className="text-emerald-700">{formatFCFA(amount)}</strong> a été crédité à la tontine.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-left text-xs font-mono border border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Réf :</span>
                  <span className="font-bold text-slate-800">{txRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Opérateur :</span>
                  <span className="text-slate-800">{provider === 'mtn_momo' ? 'MTN MoMo (*126#)' : 'Orange Money (*150#)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Statut :</span>
                  <span className="text-emerald-700 font-semibold">Confirmé & Sécurisé</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition shadow-sm"
              >
                Voir le reçu officiel
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Échec de la transaction</h4>
                <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
