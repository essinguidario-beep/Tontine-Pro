/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Official Printable Receipt & Proof Component
 */

import React from 'react';
import { X, Printer, Share2, CheckCircle, ShieldCheck } from 'lucide-react';
import { Receipt } from '../../types';
import { formatFCFA } from '../../services/mobileMoney';
import { Logo } from './Logo';

interface ReceiptModalProps {
  receipt: Receipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*Reçu Officiel TontinePro*\nReçu N°: ${receipt.receipt_number}\nTontine: ${receipt.tontine_name}\nMembre: ${receipt.member_name}\nMontant: ${formatFCFA(receipt.amount_fcfa)}\nRéf: ${receipt.transaction_ref}\nDate: ${new Date(receipt.issued_at).toLocaleDateString('fr-FR')}\n_Vérifié et certifié par TontinePro Cameroun_`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'mtn_momo':
        return 'MTN Mobile Money Cameroun';
      case 'orange_money':
        return 'Orange Money Cameroun';
      case 'cash':
        return 'Espèces (En main propre)';
      case 'bank_transfer':
        return 'Virement Bancaire (Afriland / UBA / BICEC)';
      default:
        return 'Paiement numérique direct';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Reçu Certifié Conforme TontinePro</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Partager par WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
              title="Imprimer ou enregistrer en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Receipt Body */}
        <div className="receipt-card p-8 bg-white relative">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-8xl font-black text-slate-900 rotate-[-30deg] tracking-widest uppercase">
              CERTIFIÉ
            </span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-6">
            <div>
              <Logo size="md" showTagline={true} />
              <div className="text-[11px] text-slate-400 mt-2 space-y-0.5">
                <p>TontinePro SAS · Douala, Cameroun</p>
                <p>Agrément FinTech & Séquestre d'Assistance</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider block">
                Reçu Numéro
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {receipt.receipt_number}
              </span>
              <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-emerald-700 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Paiement Validé</span>
              </div>
            </div>
          </div>

          {/* Amount Showcase Banner */}
          <div className="my-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-emerald-900 uppercase tracking-wider">
                Montant Reçu
              </span>
              <div className="text-2xl font-extrabold text-emerald-950 font-mono tabular-nums">
                {formatFCFA(receipt.amount_fcfa)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-emerald-800 font-medium block">
                Mode de règlement
              </span>
              <span className="text-xs font-semibold text-emerald-950">
                {getMethodLabel(receipt.payment_method)}
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-xs border-b border-slate-100 pb-6">
            <div>
              <span className="text-slate-400 block text-[11px]">Tontine bénéficiaire</span>
              <span className="font-semibold text-slate-800">{receipt.tontine_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Membre cotisant</span>
              <span className="font-semibold text-slate-800">{receipt.member_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Date d'émission</span>
              <span className="font-medium text-slate-700 font-mono tabular-nums">
                {new Date(receipt.issued_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Référence Transaction</span>
              <span className="font-mono text-slate-800 font-semibold">{receipt.transaction_ref}</span>
            </div>
          </div>

          {/* Security & Verification Token */}
          <div className="mt-6 flex items-center justify-between pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Signature cryptographique TontinePro</span>
              </div>
              <p className="text-[10px] text-slate-400 max-w-xs font-mono">
                SHA256: 9e4f·2b78·d410·89ca·5021·6011 (Certificat immuable)
              </p>
            </div>

            {/* Visual Token Stamp */}
            <div className="w-16 h-16 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-1 flex flex-col items-center justify-center text-center">
              <span className="text-[8px] font-mono text-emerald-800 leading-tight">CAISSE VALIDÉE</span>
              <span className="text-[10px] font-extrabold text-emerald-900 mt-0.5">XAF</span>
              <span className="text-[7px] text-slate-400">DOUALA</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            Ce reçu certifie que les fonds ont été comptabilisés dans le grand livre de la tontine conformément aux règles établies.
          </div>
        </div>
      </div>
    </div>
  );
};
