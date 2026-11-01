/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Recent Payments List Component
 * Stylized list showing the 5 most recent contribution payments with colored status pastille
 */

import React from 'react';
import {
  Coins,
  Receipt as ReceiptIcon,
  Smartphone,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { formatFCFA } from '../../services/mobileMoney';
import { Contribution, TontineMember, Tontine, Receipt } from '../../types';

interface RecentPaymentsListProps {
  contributions: Contribution[];
  members: TontineMember[];
  tontines: Tontine[];
  receipts: Receipt[];
  onViewReceipt: (receipt: Receipt) => void;
  onNavigateAll: () => void;
}

export const RecentPaymentsList: React.FC<RecentPaymentsListProps> = ({
  contributions,
  members,
  tontines,
  receipts,
  onViewReceipt,
  onNavigateAll,
}) => {
  // Take up to 5 most recent payments
  const recentPayments = contributions.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-left">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Derniers Paiements de Cotisations
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              5 Récents
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Flux de trésorerie en temps réel enregistrés sur vos tontines
          </p>
        </div>

        <button
          onClick={onNavigateAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
        >
          <span>Tout afficher</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stylized List */}
      {recentPayments.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          Aucun paiement de cotisation enregistré pour le moment.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {recentPayments.map((c) => {
            const memberInfo = members.find((m) => m.id === c.member_id);
            const tontineInfo = tontines.find((t) => t.id === c.tontine_id);
            const receipt = receipts.find((r) => r.transaction_ref === c.transaction_ref);
            const isConfirmed = c.status === 'confirmed';
            const isPending = c.status === 'pending';

            return (
              <div
                key={c.id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Member Identity & Payment Channel */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={
                        memberInfo?.avatar_url ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          c.member_name
                        )}&backgroundColor=059669`
                      }
                      alt={c.member_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                    />
                    {/* Method Badge Over Avatar */}
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white shadow-xs ${
                        c.payment_method === 'mtn_momo'
                          ? 'bg-amber-500'
                          : c.payment_method === 'orange_money'
                          ? 'bg-orange-500'
                          : 'bg-emerald-600'
                      }`}
                      title={
                        c.payment_method === 'mtn_momo'
                          ? 'MTN MoMo (*126#)'
                          : c.payment_method === 'orange_money'
                          ? 'Orange Money (*150#)'
                          : 'Espèces / Virement'
                      }
                    >
                      {c.payment_method === 'mtn_momo' || c.payment_method === 'orange_money' ? (
                        <Smartphone className="w-2.5 h-2.5" />
                      ) : (
                        <Wallet className="w-2.5 h-2.5" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {c.member_name}
                      </span>
                      {tontineInfo && (
                        <span className="hidden md:inline-block text-[10px] text-slate-500 truncate max-w-[140px]">
                          · {tontineInfo.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono text-slate-400 text-[10px]">
                        {c.transaction_ref}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono text-slate-500 text-[10px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(c.payment_date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount, Colored Status Pastille & Receipt Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pl-13 sm:pl-0">
                  {/* Status Indicator with Colored Pastille */}
                  <div className="flex items-center gap-1.5">
                    {isConfirmed ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Confirmé</span>
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>En attente</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Rejeté</span>
                      </span>
                    )}
                  </div>

                  {/* Financial Amount */}
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-xs sm:text-sm tabular-nums">
                      +{formatFCFA(c.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {c.payment_method === 'mtn_momo'
                        ? 'MTN MoMo'
                        : c.payment_method === 'orange_money'
                        ? 'Orange Money'
                        : c.payment_method === 'cash'
                        ? 'Espèces'
                        : 'Virement'}
                    </div>
                  </div>

                  {/* Receipt Button */}
                  {receipt && (
                    <button
                      type="button"
                      onClick={() => onViewReceipt(receipt)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition"
                      title="Télécharger / Visualiser le Reçu Numérique"
                    >
                      <ReceiptIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Summary / Quick Note */}
      <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transactions certifiées et signées par TontinePro Mobile Money Gateway</span>
        </span>
        <button
          onClick={onNavigateAll}
          className="font-medium text-emerald-700 hover:underline"
        >
          Voir l'historique complet
        </button>
      </div>
    </div>
  );
};
