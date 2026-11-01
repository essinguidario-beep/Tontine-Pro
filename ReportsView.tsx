/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Financial Reports, Statements & Export View
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Building,
  Receipt as ReceiptIcon,
  CheckCircle,
  TrendingDown,
  Coins,
  MessageCircle,
} from 'lucide-react';
import { storage } from '../services/storage';
import { formatFCFA } from '../services/mobileMoney';
import { getWhatsAppReminderUrl } from '../services/whatsapp';
import { Receipt, UserProfile } from '../types';

interface ReportsViewProps {
  currentUser: UserProfile;
  onViewReceipt: (receipt: Receipt) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ currentUser, onViewReceipt }) => {
  const [tontines, setTontines] = useState(storage.getTontines());
  const [selectedTontineId, setSelectedTontineId] = useState<string>(storage.getTontines()[0]?.id || '');
  const [reportType, setReportType] = useState<'monthly' | 'members' | 'ledger' | 'receipts'>('monthly');

  // Reactive subscription
  React.useEffect(() => {
    const listTontines = storage.getTontines();
    setTontines(listTontines);

    const unsubscribe = storage.subscribe(() => {
      const updatedTontines = storage.getTontines();
      setTontines(updatedTontines);
      setSelectedTontineId((prev) => {
        if (!prev && updatedTontines.length > 0) return updatedTontines[0].id;
        return prev;
      });
    });
    return unsubscribe;
  }, []);

  const currentTontine = tontines.find((t) => t.id === selectedTontineId) || tontines[0];
  const summary = storage.getFinancialSummary(currentTontine?.id);
  const members = storage.getMembers(currentTontine?.id);
  const contributions = storage.getContributions(currentTontine?.id);
  const receipts = storage.getReceipts();

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Generate CSV data based on contributions
    const headers = ['Reference', 'Membre', 'Date', 'Mode_Paiement', 'Montant_FCFA', 'Statut'];
    const rows = contributions.map((c) => [
      c.transaction_ref,
      `"${c.member_name}"`,
      c.payment_date,
      c.payment_method,
      c.amount,
      c.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tontinepro_bilan_${currentTontine.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Espace de Gestion</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Rapports & Reçus</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            États Comptables & Justificatifs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Génération de bilans périodiques, attestations financières et exports Excel certifiés.
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
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Exporter en fichier CSV pour Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer Bilan PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        {[
          { id: 'monthly', label: 'Bilan Mensuel de Caisse' },
          { id: 'members', label: 'Situation des Membres' },
          { id: 'ledger', label: 'Journal des Écritures' },
          { id: 'receipts', label: 'Reçus Certifiés Disponibles' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as typeof reportType)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 ${
              reportType === tab.id
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 print:border-none print:shadow-none space-y-6">
        {/* Printable Letterhead */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="font-extrabold text-base text-slate-900">TONTINEPRO CAMEROUN</div>
            <div className="text-xs font-bold text-emerald-800 mt-0.5">{currentTontine?.name}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Rapport certifié pour l'exercice en cours · Douala / Yaoundé
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-900 font-mono">
              Date : {new Date().toLocaleDateString('fr-FR')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Devise : FCFA (XAF)</div>
            <div className="text-[10px] font-mono text-emerald-700 font-semibold mt-1">
              STATUS : COMPTABILISÉ & CONFORME
            </div>
          </div>
        </div>

        {/* TAB 1: Bilan Mensuel */}
        {reportType === 'monthly' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Total Cotisations Encaissées</span>
                <div className="text-xl font-mono font-bold text-slate-900 tabular-nums mt-1">
                  +{formatFCFA(summary.totalCollected)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Total Cagnottes Distribuées</span>
                <div className="text-xl font-mono font-bold text-slate-900 tabular-nums mt-1">
                  -{formatFCFA(summary.totalPayouts)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[11px] text-emerald-900 font-medium">Solde Net Restant en Trésorerie</span>
                <div className="text-xl font-mono font-extrabold text-emerald-950 tabular-nums mt-1">
                  {formatFCFA(summary.cashBalance)}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-3 uppercase tracking-wider">
                Synthèse Financière par Poste
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Poste Comptable</th>
                      <th className="px-4 py-2.5">Description</th>
                      <th className="px-4 py-2.5 text-right">Montant (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-slate-900">Encaissements Cotisations</td>
                      <td className="px-4 py-2.5 text-slate-600">Versements vérifiés des adhérents</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700 tabular-nums">
                        +{formatFCFA(summary.totalCollected)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-slate-900">Décaissements Cagnottes</td>
                      <td className="px-4 py-2.5 text-slate-600">Paiements aux bénéficiaires des tours</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                        -{formatFCFA(summary.totalPayouts)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-slate-900">Frais de Fonctionnement</td>
                      <td className="px-4 py-2.5 text-slate-600">Collations, salle, télécoms MoMo</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-red-600 tabular-nums">
                        -{formatFCFA(summary.totalExpenses)}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/80 font-bold">
                      <td className="px-4 py-3 text-slate-900" colSpan={2}>
                        SOLDE DISPONIBLE EN CAISSE
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-900 text-sm tabular-nums">
                        {formatFCFA(summary.cashBalance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Situation des Membres */}
        {reportType === 'members' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Adhérent</th>
                  <th className="px-4 py-2.5">Téléphone</th>
                  <th className="px-4 py-2.5">Rôle</th>
                  <th className="px-4 py-2.5 text-right">Total Versé</th>
                  <th className="px-4 py-2.5 text-right">Arriérés</th>
                  <th className="px-4 py-2.5 text-center">Bénéfice Cagnotte</th>
                  <th className="px-4 py-2.5 text-right">Rappel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{m.member_name}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600 tabular-nums">{m.phone}</td>
                    <td className="px-4 py-2.5 capitalize text-slate-700">{m.role}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatFCFA(m.total_contributed)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                      {m.total_debt > 0 ? (
                        <span className="text-red-600 font-bold">{formatFCFA(m.total_debt)}</span>
                      ) : (
                        <span className="text-slate-400">0 FCFA</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {m.is_beneficiary_paid ? (
                        <span className="text-emerald-700 font-bold">✓ Reçue</span>
                      ) : (
                        <span className="text-slate-400">En attente</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {m.total_debt > 0 ? (
                        <a
                          href={getWhatsAppReminderUrl({
                            phone: m.phone,
                            memberName: m.member_name,
                            amount: m.total_debt,
                            tontineName: currentTontine ? currentTontine.name : 'Tontine',
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-[10px] rounded-md transition border border-[#25D366]/30"
                          title="Envoyer un rappel de cotisation par WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3 text-[#25D366]" />
                          <span>Rappel WA</span>
                        </a>
                      ) : (
                        <span className="text-emerald-700 text-[10px] font-bold">À jour ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: Journal */}
        {reportType === 'ledger' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Référence</th>
                  <th className="px-4 py-2.5">Membre</th>
                  <th className="px-4 py-2.5">Moyen</th>
                  <th className="px-4 py-2.5 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {contributions.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-2">{new Date(c.payment_date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-2 font-bold text-slate-800">{c.transaction_ref}</td>
                    <td className="px-4 py-2 font-sans font-medium text-slate-900">{c.member_name}</td>
                    <td className="px-4 py-2 font-sans capitalize text-slate-600">{c.payment_method}</td>
                    <td className="px-4 py-2 text-right font-bold text-emerald-800 tabular-nums">
                      +{formatFCFA(c.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: Reçus Certifiés */}
        {reportType === 'receipts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {receipts.map((r) => (
              <div
                key={r.id}
                onClick={() => onViewReceipt(r)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <ReceiptIcon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-mono font-bold text-slate-900 text-xs truncate">
                      {r.receipt_number}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {r.member_name} · {formatFCFA(r.amount_fcfa)}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-700 hover:underline shrink-0">
                  Imprimer →
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Signatures & Certification Stamp (Printed at bottom) */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <span className="text-slate-500 block mb-8">Le / La Trésorier(e) de la Tontine</span>
            <div className="border-t border-slate-300 pt-1 font-semibold text-slate-800">
              Marie Claire Ngo Ndjock
            </div>
          </div>
          <div>
            <span className="text-slate-500 block mb-8">Le / La Président(e) de Séance</span>
            <div className="border-t border-slate-300 pt-1 font-semibold text-slate-800">
              Jean-Paul Kamga
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
