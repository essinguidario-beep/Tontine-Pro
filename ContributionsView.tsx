/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Contributions Ledger & Payment Verification View
 */

import React, { useState, useEffect } from 'react';
import {
  Coins,
  Plus,
  Search,
  Filter,
  Receipt as ReceiptIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  X,
  Smartphone,
  MessageCircle,
} from 'lucide-react';
import { storage } from '../services/storage';
import { formatFCFA, generateTransactionReference } from '../services/mobileMoney';
import { getWhatsAppReminderUrl } from '../services/whatsapp';
import { Contribution, PaymentMethod, PaymentStatus, Receipt, UserProfile } from '../types';

interface ContributionsViewProps {
  currentUser: UserProfile;
  onOpenMobileMoneyPayment: (tontineId: string, memberId: string, memberName: string) => void;
  onViewReceipt: (receipt: Receipt) => void;
  isRecordModalOpen?: boolean;
  onCloseRecordModal?: () => void;
  defaultTontineId?: string;
  defaultMemberId?: string;
}

export const ContributionsView: React.FC<ContributionsViewProps> = ({
  currentUser,
  onOpenMobileMoneyPayment,
  onViewReceipt,
  isRecordModalOpen: initialRecordOpen = false,
  onCloseRecordModal,
  defaultTontineId,
  defaultMemberId,
}) => {
  const [contributions, setContributions] = useState(storage.getContributions());
  const [search, setSearch] = useState('');
  const [selectedTontineId, setSelectedTontineId] = useState<string>(defaultTontineId || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(initialRecordOpen);

  useEffect(() => {
    if (initialRecordOpen !== undefined) {
      setIsModalOpen(initialRecordOpen);
    }
  }, [initialRecordOpen]);

  // Reactive subscription
  useEffect(() => {
    setContributions(storage.getContributions());
    const unsubscribe = storage.subscribe(() => {
      setContributions(storage.getContributions());
    });
    return unsubscribe;
  }, []);

  const tontines = storage.getTontines();
  const allMembers = storage.getMembers();
  const receipts = storage.getReceipts();

  // Form states
  const [formTontineId, setFormTontineId] = useState(defaultTontineId || tontines[0]?.id || '');
  const [formMemberId, setFormMemberId] = useState(defaultMemberId || allMembers[0]?.id || '');
  const [amount, setAmount] = useState(50000);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [txRef, setTxRef] = useState(generateTransactionReference('COT'));
  const [notes, setNotes] = useState('Cotisation régulière');
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setContributions(storage.getContributions());
  };

  const handleOpenAdd = () => {
    setTxRef(generateTransactionReference('COT'));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleTontineChange = (newTontineId: string) => {
    setFormTontineId(newTontineId);
    const tontineObj = tontines.find((t) => t.id === newTontineId);
    if (tontineObj) {
      setAmount(tontineObj.contribution_amount);
    }
    const tontineMembers = storage.getMembers(newTontineId);
    if (tontineMembers.length > 0) {
      setFormMemberId(tontineMembers[0].id);
    }
  };

  const handleSaveContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setFormError('Le montant doit être supérieur à 0 FCFA.');
      return;
    }

    const res = storage.recordContribution({
      tontine_id: formTontineId,
      member_id: formMemberId,
      amount,
      payment_method: paymentMethod,
      transaction_ref: txRef,
      notes,
      payment_date: paymentDate,
    });

    if (!res.success) {
      setFormError(res.error || 'Erreur lors de l’enregistrement.');
      return;
    }

    refreshList();
    setIsModalOpen(false);
    if (onCloseRecordModal) onCloseRecordModal();

    if (res.receipt) {
      onViewReceipt(res.receipt);
    }
  };

  const handleStatusChange = (c: Contribution, newStatus: PaymentStatus) => {
    storage.updateContributionStatus(c.id, newStatus);
    refreshList();
  };

  const filtered = contributions.filter((c) => {
    const matchesSearch =
      c.member_name.toLowerCase().includes(search.toLowerCase()) ||
      c.transaction_ref.toLowerCase().includes(search.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesTontine = selectedTontineId === 'all' || c.tontine_id === selectedTontineId;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesTontine && matchesStatus;
  });

  const availableMembers = allMembers.filter((m) => m.tontine_id === formTontineId);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Espace de Gestion</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Cotisations & Versements</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Grand Livre des Cotisations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Validation des encaissements, détection des doublons et reçus certifiés.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const mem = allMembers[0];
              if (mem) onOpenMobileMoneyPayment(mem.tontine_id, mem.id, mem.member_name);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Payer par Mobile Money</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer un versement</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par membre, réf transaction (ex: COT-2026...)"
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTontineId}
            onChange={(e) => setSelectedTontineId(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
          >
            <option value="all">Toutes les Tontines</option>
            {tontines.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="confirmed">Confirmé</option>
            <option value="pending">En attente</option>
            <option value="rejected">Rejeté</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5">Réf Transaction</th>
                <th className="px-4 py-3.5">Membre Cotisant</th>
                <th className="px-4 py-3.5">Tontine</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Moyen de Paiement</th>
                <th className="px-4 py-3.5 text-right">Montant (FCFA)</th>
                <th className="px-4 py-3.5 text-center">Statut</th>
                <th className="px-4 py-3.5 text-right">Reçu & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => {
                const tontineObj = tontines.find((t) => t.id === c.tontine_id);
                const receipt = receipts.find((r) => r.transaction_ref === c.transaction_ref);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 text-[11px]">
                      {c.transaction_ref}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {c.member_name}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      <span className="line-clamp-1">{tontineObj ? tontineObj.name : 'Tontine'}</span>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">
                      {new Date(c.payment_date).toLocaleDateString('fr-FR')}
                    </td>

                    <td className="px-4 py-3">
                      <span className="capitalize font-medium text-slate-700">
                        {c.payment_method === 'mtn_momo'
                          ? 'MTN MoMo (*126#)'
                          : c.payment_method === 'orange_money'
                          ? 'Orange Money (*150#)'
                          : c.payment_method === 'cash'
                          ? 'Espèces en réunion'
                          : 'Virement bancaire'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-extrabold text-slate-900 tabular-nums text-sm">
                      {formatFCFA(c.amount)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c, e.target.value as PaymentStatus)}
                        className={`text-[10px] font-bold rounded px-2 py-0.5 border cursor-pointer ${
                          c.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : c.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        <option value="confirmed">Confirmé</option>
                        <option value="pending">En attente</option>
                        <option value="rejected">Rejeté</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status === 'pending' && (() => {
                          const member = allMembers.find((m) => m.id === c.member_id);
                          return (
                            <a
                              href={getWhatsAppReminderUrl({
                                phone: member?.phone || '',
                                memberName: c.member_name,
                                amount: c.amount,
                                tontineName: tontineObj ? tontineObj.name : 'Tontine',
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-[10px] rounded-lg transition border border-[#25D366]/30"
                              title="Envoyer le rappel WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3 text-[#25D366]" />
                              <span>Rappel WA</span>
                            </a>
                          );
                        })()}

                        {receipt ? (
                          <button
                            type="button"
                            onClick={() => onViewReceipt(receipt)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 rounded-lg transition"
                          >
                            <ReceiptIcon className="w-3 h-3" />
                            <span>Reçu</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Contribution Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Enregistrer une Cotisation</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseRecordModal) onCloseRecordModal();
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContribution} className="p-6 space-y-4 text-left">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tontine concernée *
                  </label>
                  <select
                    value={formTontineId}
                    onChange={(e) => handleTontineChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    {tontines.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Membre cotisant *
                  </label>
                  <select
                    value={formMemberId}
                    onChange={(e) => setFormMemberId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    {availableMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.member_name} ({m.phone})</option>
                    ))}
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
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono tabular-nums font-bold"
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
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mode de règlement *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'mtn_momo', label: 'MTN MoMo' },
                    { id: 'orange_money', label: 'Orange Money' },
                    { id: 'cash', label: 'Espèces' },
                    { id: 'bank_transfer', label: 'Virement' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition text-center ${
                        paymentMethod === m.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
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
                    placeholder="COT-2026..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setTxRef(generateTransactionReference('COT'))}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Générer
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Identifiant immuable. Les doublons sont strictement bloqués.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observation / Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Cotisation cycle régulier"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Confirmer & Générer Reçu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
