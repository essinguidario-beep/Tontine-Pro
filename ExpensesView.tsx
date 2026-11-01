/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Expenses & Treasury Ledger View
 */

import React, { useState } from 'react';
import {
  TrendingDown,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Calendar,
  X,
  AlertCircle,
} from 'lucide-react';
import { storage } from '../services/storage';
import { formatFCFA } from '../services/mobileMoney';
import { Expense, ExpenseCategory, UserProfile } from '../types';

interface ExpensesViewProps {
  currentUser: UserProfile;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ currentUser }) => {
  const [tontines, setTontines] = useState(storage.getTontines());
  const [selectedTontineId, setSelectedTontineId] = useState<string>(storage.getTontines()[0]?.id || '');
  const [expenses, setExpenses] = useState<Expense[]>(storage.getExpenses());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reactive subscription
  React.useEffect(() => {
    const listTontines = storage.getTontines();
    setTontines(listTontines);
    setExpenses(storage.getExpenses());

    const unsubscribe = storage.subscribe(() => {
      const updatedTontines = storage.getTontines();
      setTontines(updatedTontines);
      setExpenses(storage.getExpenses());
      setSelectedTontineId((prev) => {
        if (!prev && updatedTontines.length > 0) return updatedTontines[0].id;
        return prev;
      });
    });
    return unsubscribe;
  }, []);

  // Form states
  const [category, setCategory] = useState<ExpenseCategory>('catering_reception');
  const [amount, setAmount] = useState(15000);
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [authorizedBy, setAuthorizedBy] = useState(`${currentUser.full_name} (${currentUser.role})`);
  const [formError, setFormError] = useState('');

  const currentTontine = tontines.find((t) => t.id === selectedTontineId) || tontines[0];
  const summary = storage.getFinancialSummary(currentTontine?.id);
  const list = expenses.filter((e) => !currentTontine || e.tontine_id === currentTontine.id);

  const refreshList = () => {
    setExpenses(storage.getExpenses());
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setFormError('La description de la dépense est requise.');
      return;
    }
    if (amount <= 0) {
      setFormError('Le montant doit être supérieur à 0 FCFA.');
      return;
    }

    storage.recordExpense({
      tontine_id: currentTontine.id,
      category,
      amount,
      expense_date: expenseDate,
      description,
      authorized_by: authorizedBy,
      status: 'approved',
    });

    refreshList();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Espace de Gestion</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Dépenses & Trésorerie</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Caisse & Dépenses Opérationnelles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comptabilisation des frais de réunion, collations, secours d'entraide et télécoms.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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

          <button
            onClick={() => {
              setDescription('');
              setAmount(10000);
              setFormError('');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer Dépense</span>
          </button>
        </div>
      </div>

      {/* Treasury Balance Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Total Cotisations Encaissées</div>
          <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-1">
            +{formatFCFA(summary.totalCollected)}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">Flux entrant en caisse</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500">Total Dépenses & Frais</div>
          <div className="text-lg font-bold text-red-600 font-mono tabular-nums mt-1">
            -{formatFCFA(summary.totalExpenses)}
          </div>
          <div className="text-[10px] text-slate-400">Collations, salle & télécoms</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
          <div className="text-[11px] font-medium text-emerald-900">Solde Net Restant en Caisse</div>
          <div className="text-lg font-extrabold text-emerald-950 font-mono tabular-nums mt-1">
            {formatFCFA(summary.cashBalance)}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">Disponible pour décaissement</div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Grand Livre des Dépenses ({list.length} opérations)
          </h3>
          <span className="text-xs text-slate-400">Aucune suppression unilatérale (audit immuable)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Réf Unique</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Ordonnateur</th>
                <th className="px-4 py-3 text-right">Montant (FCFA)</th>
                <th className="px-4 py-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-mono font-bold text-slate-800 text-[11px]">{e.reference}</td>
                  <td className="px-4 py-3 capitalize text-slate-700 font-medium">
                    {e.category === 'catering_reception'
                      ? 'Collation & Réception'
                      : e.category === 'hall_rental'
                      ? 'Location de Salle'
                      : e.category === 'bank_telecom'
                      ? 'Frais Passerelle / MoMo'
                      : e.category === 'solidarity_grant'
                      ? 'Secours / Solidarité'
                      : 'Frais de gestion'}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">
                    {new Date(e.expense_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-medium">{e.description}</td>
                  <td className="px-4 py-3 text-slate-600">{e.authorized_by}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-red-600 tabular-nums">
                    -{formatFCFA(e.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {e.status === 'approved' ? 'Approuvé' : e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Enregistrer une Dépense de Caisse</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4 text-left">
              {formError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie de dépense</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="catering_reception">Collation & Boissons de Réunion</option>
                  <option value="hall_rental">Location Salle / Espace</option>
                  <option value="bank_telecom">Frais Bancaires / Télécoms / SMS</option>
                  <option value="solidarity_grant">Don de Solidarité / Secours Santé</option>
                  <option value="administrative">Fournitures Administratives</option>
                  <option value="other">Autre dépense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Montant déboursé (FCFA) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono tabular-nums font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Motif *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Achat boissons et beignets pour la séance de dimanche"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date d'engagement</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Autorisé par</label>
                  <input
                    type="text"
                    value={authorizedBy}
                    onChange={(e) => setAuthorizedBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
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
                  Enregistrer la sortie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
