/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Global Add Member Modal
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  AlertCircle,
  CheckCircle2,
  Shield,
  Phone,
  Mail,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { validateCameroonPhone } from '../../services/mobileMoney';
import { TontineMember, TontineRole, UserProfile } from '../../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  targetTontineId?: string;
  onSuccess: (member: TontineMember) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetTontineId,
  onSuccess,
}) => {
  const tontines = storage.getTontines();

  const [tontineId, setTontineId] = useState(targetTontineId || tontines[0]?.id || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+237 6');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TontineRole>('member');
  const [shares, setShares] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdMember, setCreatedMember] = useState<TontineMember | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setCreatedMember(null);
      setTontineId(targetTontineId || tontines[0]?.id || '');
      setName('');
      setPhone('+237 6');
      setEmail('');
      setRole('member');
      setShares(1);
    }
  }, [isOpen, targetTontineId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tontineId) {
      setError('Veuillez sélectionner la tontine d’adhésion.');
      return;
    }
    if (!name.trim()) {
      setError('Le nom et prénom du membre sont obligatoires.');
      return;
    }
    const phoneVal = validateCameroonPhone(phone);
    if (!phoneVal.isValid) {
      setError('Le numéro doit être un numéro camerounais valide (+237 6XX XX XX XX).');
      return;
    }

    // Duplicate prevention (Section 6)
    const dupCheck = storage.hasMemberDuplicate(tontineId, name.trim(), phoneVal.formatted);
    if (dupCheck.isDuplicate) {
      setError(dupCheck.reason || 'Ce membre est déjà enregistré dans cette tontine.');
      return;
    }

    // Quota evaluation (Section 10)
    const limits = storage.getUserSubscriptionLimits(currentUser.id);
    const existingMembers = storage.getMembers(tontineId);
    if (existingMembers.length >= limits.maxMembersPerTontine) {
      setError(
        `Limite de membres de votre offre (${limits.planLabel}) atteinte : maximum ${limits.maxMembersPerTontine} adhérents par tontine. Passez au forfait supérieur pour inscrire davantage de membres.`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const saved = storage.createMember({
        tontine_id: tontineId,
        member_name: name.trim(),
        phone: phoneVal.formatted,
        email: email.trim() || undefined,
        role,
        shares_count: Number(shares) || 1,
        status: 'active',
        joined_at: new Date().toISOString().slice(0, 10),
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          name.trim()
        )}&backgroundColor=059669`,
      });

      setIsSubmitting(false);
      setCreatedMember(saved);
      onSuccess(saved);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Erreur lors de l'ajout du membre.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-left">
        {createdMember ? (
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                Adhésion Enregistrée
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                Membre ajouté avec succès !
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                <strong className="text-slate-900">{createdMember.member_name}</strong> a été intégré à la tontine avec le rôle de <strong className="capitalize">{createdMember.role}</strong>.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition"
              >
                Terminer
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Ajouter un Membre</h3>
                  <p className="text-[10px] text-slate-400">Enregistrer un adhérent dans la tontine</p>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tontine de destination *
                </label>
                <select
                  value={tontineId}
                  onChange={(e) => setTontineId(e.target.value)}
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
                  Nom et Prénom du membre *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Samuel Eto'o"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numéro de téléphone (+237) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+237 6XX XX XX XX"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse e-mail (optionnelle)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="membre@email.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rôle dans la tontine
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as TontineRole)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="member">Membre cotisant</option>
                    <option value="treasurer">Trésorier(ère)</option>
                    <option value="secretary">Secrétaire</option>
                    <option value="censor">Censeur / Commissaire aux comptes</option>
                    <option value="president">Co-Président(e)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre de parts souscrites
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={shares}
                    onChange={(e) => setShares(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
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
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer le membre'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
