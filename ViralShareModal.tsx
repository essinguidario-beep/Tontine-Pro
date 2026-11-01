/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro Lite - Viral Share & Invitation Modal
 * Section 12: WhatsApp viral distribution & tontine invites
 */

import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Building,
  UserPlus,
  Send,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { formatFCFA } from '../../services/mobileMoney';
import {
  getWhatsAppTontineInviteUrl,
  getWhatsAppManagerReferralUrl,
} from '../../services/whatsapp';
import { UserProfile, Tontine } from '../../types';

interface ViralShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  initialTontineId?: string;
}

export const ViralShareModal: React.FC<ViralShareModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialTontineId,
}) => {
  const tontines = storage.getTontines();
  const [selectedTontineId, setSelectedTontineId] = useState(
    initialTontineId || tontines[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'tontine_invite' | 'manager_referral'>('tontine_invite');
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const currentTontine = tontines.find((t) => t.id === selectedTontineId) || tontines[0];

  const tontineInviteUrl = currentTontine
    ? getWhatsAppTontineInviteUrl({
        tontineName: currentTontine.name,
        contributionAmount: currentTontine.contribution_amount,
        frequency:
          currentTontine.frequency === 'monthly'
            ? 'Mensuel'
            : currentTontine.frequency === 'weekly'
            ? 'Hebdomadaire'
            : 'Quotidien',
      })
    : '';

  const managerReferralUrl = getWhatsAppManagerReferralUrl(currentUser.full_name);

  const tontineShareText = currentTontine
    ? `Rejoignez notre tontine "${currentTontine.name}" sur TontinePro Lite ! Cotisation : ${formatFCFA(
        currentTontine.contribution_amount
      )} (${currentTontine.frequency}). Suivi transparent et reçus instantanés : https://tontinepro.codunk.com`
    : '';

  const managerShareText = `Je vous invite à découvrir TontinePro Lite, la solution SaaS camerounaise pour gérer simplement nos tontines, cotisations et rapports financiers sans erreurs ! https://tontinepro.codunk.com`;

  const currentShareText = activeTab === 'tontine_invite' ? tontineShareText : managerShareText;
  const currentWhatsAppUrl = activeTab === 'tontine_invite' ? tontineInviteUrl : managerReferralUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentShareText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xs">
              <Share2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                <span>Partage & Invitations</span>
                <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full uppercase">
                  WhatsApp
                </span>
              </h3>
              <p className="text-xs text-emerald-100">
                Invitez des membres ou recommandez TontinePro Lite en 1 clic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('tontine_invite')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'tontine_invite'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-emerald-700" />
            <span>Inviter à une tontine</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manager_referral')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'manager_referral'
                ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-blue-700" />
            <span>Inviter un responsable</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4">
          {activeTab === 'tontine_invite' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sélectionnez la tontine à partager
                </label>
                <select
                  value={selectedTontineId}
                  onChange={(e) => setSelectedTontineId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                >
                  {tontines.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({formatFCFA(t.contribution_amount)})
                    </option>
                  ))}
                </select>
              </div>

              {currentTontine && (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>{currentTontine.name}</span>
                    <span className="font-mono text-emerald-800">
                      {formatFCFA(currentTontine.contribution_amount)} / séance
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {currentTontine.description || 'Tontine active gérée sur TontinePro Lite.'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 space-y-2">
              <div className="font-extrabold flex items-center gap-1.5 text-blue-900">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Recommandez TontinePro Lite à d'autres trésoriers</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Aidez vos amis présidents ou trésoriers d'associations au Cameroun à passer à la gestion moderne sans papier.
              </p>
            </div>
          )}

          {/* Message Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Message WhatsApp prêt à envoyer
            </label>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
              {currentShareText}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition"
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Texte copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copier le message</span>
                </>
              )}
            </button>

            <a
              href={currentWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Send className="w-4 h-4" />
              <span>Ouvrir dans WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
