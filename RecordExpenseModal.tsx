/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Global Record Expense Modal
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingDown,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Receipt,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { storage } from '../../services/storage';
import { formatFCFA } from '../../services/mobileMoney';
import { Expense, ExpenseCategory, UserProfile } from '../../types';

interface RecordExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  defaultTontineId?: string;
  onSuccess?: (expense: Expense) => void;
}

const CATEGORIES: { id: ExpenseCategory; label: string; icon: string; desc: string }[] = [
  {
    id: 'catering_reception',
    label: 'Collation & Réception',
    icon: '☕',
    desc: 'Boissons, repas de séance, traiteur',
  },
  {
    id: 'hall_rental',
    label: 'Location de Salle',
    icon: '🏛️',
    desc: 'Salle de réunion, sonorisation, chaises',
  },
  {
    id: 'bank_telecom',
    label: 'Frais Bancaires / Télécoms',
    icon: '📶',
    desc: 'SMS groupés, frais de retrait MoMo/OM',
  },
  {
    id: 'solidarity_grant',
    label: 'Secours & Solidarité',
    icon: '🤝',
    desc: 'Assistance sociale, deuil, naissance',
  },
  {
    id: 'administrative',
    label: 'Frais Administratifs',
    icon: '📁',
    desc: 'Registres, fournitures, légalisations',
  },
  {
    id: 'other',
    label: 'Autre Dépense',
    icon: '📦',
    desc: 'Imprévus ou dépenses diverses',
  },
];

export const RecordExpenseModal: React.FC<RecordExpenseModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  defaultTontineId,
  onSuccess,
}) => {
  const tontines = storage.getTontines();
  const [tontineId, setTontineId] = useState(defaultTontineId || tontines[0]?.id || '');
  const [category, setCategory] = useState<ExpenseCategory>('catering_reception');
  const [amount, setAmount] = useState<number>(15000);
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [authorizedBy, setAuthorizedBy] = useState(`${currentUser.full_name} (${currentUser.role})`);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdExpense, setCreatedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setCreatedExpense(null);
      const activeTontineId = defaultTontineId || tontines[0]?.id || '';
      setTontineId(activeTontineId);
      setCategory('catering_reception');
      setAmount(15000);
      setDescription('');
      setExpenseDate(new Date().toISOString().slice(0, 10));
      setAuthorizedBy(`${currentUser.full_name} (${currentUser.role || 'Trésorier'})`);
    }
  }, [isOpen, defaultTontineId, currentUser]);

  if (!isOpen) return null;

  const currentTontine = tontines.find((t) => t.id === tontineId) || tontines[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tontineId) {
      setError('Veuillez sélectionner une tontine.');
      return;
    }
    if (!amount || amount <= 0) {
      setError('Veuillez saisir un montant de dépense valide supérieur à 0 FCFA.');
      return;
    }
    if (!description.trim()) {
      setError('La description du motif de la dépense est obligatoire.');
      return;
    }
    if (!authorizedBy.trim()) {
      setError('Veuillez indiquer le nom du responsable ayant validé la dépense.');
      return;
    }

    setIsSubmitting(true);

    try {
      const exp = storage.recordExpense({
        tontine_id: tontineId,
        category,
        amount,
        expense_date: expenseDate,
        description: description.trim(),
        authorized_by: authorizedBy.trim(),
        status: 'approved',
      });

      setCreatedExpense(exp);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#059669', '#10B981', '#F59E0B'],
      });

      if (onSuccess) {
        onSuccess(exp);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l’enregistrement de la dépense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xs">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Déclarer une Dépense</h3>
              <p className="text-xs text-rose-100">Sortie de caisse et justification comptable</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation State */}
        {createdExpense ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-900">Dépense Enregistrée !</h4>
              <p className="text-xs text-slate-500 mt-1">
                La sortie de caisse a été comptabilisée dans la trésorerie de{' '}
                <span className="font-semibold text-slate-800">{currentTontine?.name}</span>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Référence pièce</span>
                <span className="font-mono font-bold text-slate-900">{createdExpense.reference}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Montant décaissé</span>
                <span className="font-bold text-rose-600 text-sm">
                  -{formatFCFA(createdExpense.amount)}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Catégorie</span>
                <span className="font-medium text-slate-800">
                  {CATEGORIES.find((c) => c.id === createdExpense.category)?.label || createdExpense.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Autorisé par</span>
                <span className="font-medium text-slate-800">{createdExpense.authorized_by}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCreatedExpense(null);
                  setDescription('');
                  setAmount(10000);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 transition"
              >
                Autre dépense
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-xs text-white transition shadow-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Tontine Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tontine concernée <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={tontineId}
                  onChange={(e) => setTontineId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                >
                  {tontines.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({formatFCFA(t.contribution_amount)}/séance)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Catégorie de la dépense <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-500 text-rose-950'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span className="text-base leading-none">{cat.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-tight truncate">{cat.label}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{cat.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount & Presets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Montant décaissé (FCFA) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-mono font-bold text-rose-600">
                  {formatFCFA(amount || 0)}
                </span>
              </div>
              <input
                type="number"
                min="500"
                step="500"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Ex: 25000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-mono font-bold focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                {[5000, 10000, 25000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className="px-2 py-1 rounded-lg text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition"
                  >
                    +{formatFCFA(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* Description / Motif */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Motif & Justification de la dépense <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Achat de 2 casiers de boissons et collations pour la séance du 15 mars..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none"
              />
            </div>

            {/* Date & Authorized By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Date de décaissement
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Autorisé par
                </label>
                <input
                  type="text"
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
                  placeholder="Ex: Trésorière / Président"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                <TrendingDown className="w-4 h-4" />
                <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer la Dépense'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
